const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryIndustry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondaryIndustry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attractedOutOfState: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    confidentialityRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    intellectualProperty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentIfFaculty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pointOfContactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pointOfContactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pointOfContactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usmFounders: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    miscResources: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preCompanyResources: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preCompanyFunding: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    icorps: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tcf: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tcfAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
  }
);

module.exports = Company;
