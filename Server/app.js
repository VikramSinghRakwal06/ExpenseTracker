const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const userRoutes = require('./routes/userRoute');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

module.exports = app;
