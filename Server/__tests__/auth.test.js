const request = require('supertest');
const app = require('../app');

const user = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

describe('Auth', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/v1/users/register').send(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/v1/users/register').send(user);
    const res = await request(app).post('/api/v1/users/register').send(user);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects registration with a short password', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({ ...user, password: '123' });

    expect(res.status).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/v1/users/register').send(user);
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/v1/users/register').send(user);
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: user.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  test('rejects login for an unknown email with the same generic message (no user enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
