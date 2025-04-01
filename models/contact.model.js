const { DataTypes } = require("sequelize");
const { sequelize } = require("../index");
const Company = require("./company.model");

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    background: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);

// Define the relationship between Contact and Company
Contact.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

Company.hasMany(Contact, {
  foreignKey: "companyId",
  as: "contacts",
});

// Create a separate model for emails
const ContactEmail = sequelize.define(
  "ContactEmail",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contacts",
        key: "id",
      },
    },
  },
  {
    tableName: "contact_emails",
    timestamps: true,
  }
);

// Create a separate model for phone numbers
const ContactPhone = sequelize.define(
  "ContactPhone",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contacts",
        key: "id",
      },
    },
  },
  {
    tableName: "contact_phones",
    timestamps: true,
  }
);

// Define relationships for emails and phones
Contact.hasMany(ContactEmail, {
  foreignKey: "contactId",
  as: "emails",
});

ContactEmail.belongsTo(Contact, {
  foreignKey: "contactId",
  as: "contact",
});

Contact.hasMany(ContactPhone, {
  foreignKey: "contactId",
  as: "phoneNumbers",
});

ContactPhone.belongsTo(Contact, {
  foreignKey: "contactId",
  as: "contact",
});

module.exports = {
  Contact,
  ContactEmail,
  ContactPhone,
};
