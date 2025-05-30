const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define(
    'Company',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        primaryIndustry: {
            type: DataTypes.STRING,
            allowNull: true
        },
        intellectualProperty: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fundingReceived: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        }
    },
    {
        tableName: 'companies',
        timestamps: true
    }
);

module.exports = Company;
