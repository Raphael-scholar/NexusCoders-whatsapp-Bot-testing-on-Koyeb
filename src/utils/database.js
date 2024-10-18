const mongoose = require('mongoose');
const config = require('../config');
const logger = require('./logger');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || config.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        mongoose.connection.on('connected', () => {
            logger.info('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        logger.error('Database connection failed:', error);
        process.exit(1);
    }
};

module.exports = { connectToDatabase };
