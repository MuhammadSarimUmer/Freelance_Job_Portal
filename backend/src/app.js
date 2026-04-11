const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const technologyRoutes = require('./routes/technologyRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const contractRoutes = require('./routes/contractRoutes');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/technologies', technologyRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/contracts', contractRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app;