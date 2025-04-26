const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuration = sequelize.define(
    'Configuration',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_hidden: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_disabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'configurations',
        timestamps: true
    }
);

module.exports = Configuration;
