const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
    'User',
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        tenantName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        tenantDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        tenantCategory: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tenantLogo: {
            type: DataTypes.JSON,
            allowNull: true
        }
    },
    {
        tableName: 'users',
        timestamps: true
    }
);

module.exports = User;
