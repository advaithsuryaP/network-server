const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./company.model');

const Contact = sequelize.define(
    'Contact',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        background: {
            type: DataTypes.STRING,
            allowNull: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        university: {
            type: DataTypes.STRING,
            allowNull: true
        },
        major: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        emails: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        phoneNumbers: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        isAlumni: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isContestWinner: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: 'contacts',
        timestamps: true
    }
);

// Define the relationship between Contact and Company
Contact.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

Company.hasMany(Contact, {
    foreignKey: 'companyId',
    as: 'contacts'
});

module.exports = Contact;
