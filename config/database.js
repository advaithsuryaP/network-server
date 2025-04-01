const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with Neon Postgres
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // For Neon's self-signed cert
        }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Test the database connection and sync tables
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Handle different environments
        if (process.env.NODE_ENV === 'development') {
            // In development, use alter: true to automatically update tables
            await sequelize.sync({ alter: true });
            console.log('Development mode: Database tables have been synchronized.');
        } else if (process.env.NODE_ENV === 'production') {
            // In production, don't auto-sync - use migrations instead
            console.log('Production mode: Skipping auto-sync. Please use migrations.');
        } else {
            // Default to safe sync (create if not exists)
            await sequelize.sync();
            console.log('Database tables have been created if they did not exist.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initializeDatabase();

module.exports = sequelize;
