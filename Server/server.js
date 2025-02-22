const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const colors = require('colors');
const connectDB = require('./config/connectDB');

//rest object
const app = express();

//database
connectDB();

//middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('\n📦 Request Body:'.green, req.body);
        console.log('Content-Type:', req.get('Content-Type'));
    }
    next();
});
//routes
//user-routes
const userRoutes = require('./routes/userRoute');
app.use('/api/v1/users',userRoutes);


//transaction-routes
const transactionRoutes=require('./routes/transactionRoutes');
app.use('/api/v1/transactions',transactionRoutes)

//port
const PORT = process.env.PORT || 8080;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//LISTEN server
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`.bgCyan.white);
});