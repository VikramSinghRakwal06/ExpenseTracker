const request = require('supertest');
const app = require('../app');

const userA = { name: 'User A', email: 'a@example.com', password: 'password123' };
const userB = { name: 'User B', email: 'b@example.com', password: 'password123' };

const sampleTransaction = {
  amount: 500,
  type: 'expense',
  category: 'Food',
  description: 'Lunch',
  date: new Date().toISOString(),
  paymentMode: 'Cash',
};

const registerAndLogin = async (user) => {
  const res = await request(app).post('/api/v1/users/register').send(user);
  return { token: res.body.token, userId: res.body.user._id };
};

describe('Transactions', () => {
  test('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/v1/transactions/get-transactions').send({});
    expect(res.status).toBe(401);
  });

  test('adds and lists a transaction for the authenticated user', async () => {
    const { token } = await registerAndLogin(userA);

    const addRes = await request(app)
      .post('/api/v1/transactions/add-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTransaction);
    expect(addRes.status).toBe(201);

    const listRes = await request(app)
      .post('/api/v1/transactions/get-transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].description).toBe('Lunch');
  });

  test('never returns another user\'s transactions, even if userid is spoofed in the body', async () => {
    const { token: tokenA, userId: userIdA } = await registerAndLogin(userA);
    const { token: tokenB } = await registerAndLogin(userB);

    await request(app)
      .post('/api/v1/transactions/add-transaction')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleTransaction);

    const listRes = await request(app)
      .post('/api/v1/transactions/get-transactions')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ userid: userIdA }); // attempt to read another user's data

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(0);
  });

  test('prevents deleting another user\'s transaction', async () => {
    const { token: tokenA } = await registerAndLogin(userA);
    const { token: tokenB } = await registerAndLogin(userB);

    const addRes = await request(app)
      .post('/api/v1/transactions/add-transaction')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleTransaction);

    const transactionId = addRes.body.transaction._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/transactions/delete-transaction/${transactionId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(deleteRes.status).toBe(404);
  });

  test('updates a transaction owned by the authenticated user', async () => {
    const { token } = await registerAndLogin(userA);

    const addRes = await request(app)
      .post('/api/v1/transactions/add-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleTransaction);

    const transactionId = addRes.body.transaction._id;

    const updateRes = await request(app)
      .put(`/api/v1/transactions/update-transaction/${transactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleTransaction, amount: 750 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.transaction.amount).toBe(750);
  });
});
