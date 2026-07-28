require('dotenv').config();
require('colors');

const REQUIRED_ENV_VARS = ['MONGODB_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}`.bgRed.white);
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/connectDB');

connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`.bgCyan.white);
});
