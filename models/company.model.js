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
        attractedOutOfState: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        confidentialityRequested: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        intellectualProperty: {
            type: DataTypes.STRING,
            allowNull: true
        },
        departmentIfFaculty: {
            type: DataTypes.STRING,
            allowNull: true
        },
        preCompanyFunding: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        icorps: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tcf: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: 'companies',
        timestamps: true
    }
);

module.exports = Company;
