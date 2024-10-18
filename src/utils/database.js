const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./src/utils/logger');

async function connectToDatabase() {
    try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

async function disconnectFromDatabase() {
    try {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    } catch (error) {
        logger.error('MongoDB disconnection error:', error);
        throw error;
    }
}

module.exports = {
    connectToDatabase,
    disconnectFromDatabase
};
