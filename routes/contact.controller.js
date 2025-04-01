const express = require("express");
const router = express.Router();
const {
  Contact,
  ContactEmail,
  ContactPhone,
  Company,
} = require("../models/contact.model");

// Get all contacts with company details
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      include: [
        {
          model: Company,
          as: "company",
        },
        {
          model: ContactEmail,
          as: "emails",
        },
        {
          model: ContactPhone,
          as: "phoneNumbers",
        },
      ],
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact by ID with company details
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: "company",
        },
        {
          model: ContactEmail,
          as: "emails",
        },
        {
          model: ContactPhone,
          as: "phoneNumbers",
        },
      ],
    });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new contact
router.post("/", async (req, res) => {
  try {
    const { company, emails, phoneNumbers, ...contactData } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create or find company
      let companyRecord;
      if (company.id) {
        companyRecord = await Company.findByPk(company.id);
        if (!companyRecord) {
          throw new Error("Company not found");
        }
      } else {
        companyRecord = await Company.create(company, { transaction: t });
      }

      // Create contact with company reference
      const contact = await Contact.create(
        {
          ...contactData,
          companyId: companyRecord.id,
        },
        { transaction: t }
      );

      // Create emails if provided
      if (emails && emails.length > 0) {
        await ContactEmail.bulkCreate(
          emails.map((email) => ({
            ...email,
            contactId: contact.id,
          })),
          { transaction: t }
        );
      }

      // Create phone numbers if provided
      if (phoneNumbers && phoneNumbers.length > 0) {
        await ContactPhone.bulkCreate(
          phoneNumbers.map((phone) => ({
            ...phone,
            contactId: contact.id,
          })),
          { transaction: t }
        );
      }

      // Return the created contact with all related data
      return await Contact.findByPk(contact.id, {
        include: [
          {
            model: Company,
            as: "company",
          },
          {
            model: ContactEmail,
            as: "emails",
          },
          {
            model: ContactPhone,
            as: "phoneNumbers",
          },
        ],
        transaction: t,
      });
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact
router.patch("/:id", async (req, res) => {
  try {
    const { company, emails, phoneNumbers, ...contactData } = req.body;

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Find the contact
      const contact = await Contact.findByPk(req.params.id, {
        include: [
          {
            model: Company,
            as: "company",
          },
          {
            model: ContactEmail,
            as: "emails",
          },
          {
            model: ContactPhone,
            as: "phoneNumbers",
          },
        ],
        transaction: t,
      });

      if (!contact) {
        throw new Error("Contact not found");
      }

      // Update or create company
      let companyRecord;
      if (company.id) {
        companyRecord = await Company.findByPk(company.id);
        if (!companyRecord) {
          throw new Error("Company not found");
        }
      } else {
        companyRecord = await Company.create(company, { transaction: t });
      }

      // Update contact
      await contact.update(
        {
          ...contactData,
          companyId: companyRecord.id,
        },
        { transaction: t }
      );

      // Update emails
      if (emails) {
        // Delete existing emails
        await ContactEmail.destroy({
          where: { contactId: contact.id },
          transaction: t,
        });

        // Create new emails
        if (emails.length > 0) {
          await ContactEmail.bulkCreate(
            emails.map((email) => ({
              ...email,
              contactId: contact.id,
            })),
            { transaction: t }
          );
        }
      }

      // Update phone numbers
      if (phoneNumbers) {
        // Delete existing phone numbers
        await ContactPhone.destroy({
          where: { contactId: contact.id },
          transaction: t,
        });

        // Create new phone numbers
        if (phoneNumbers.length > 0) {
          await ContactPhone.bulkCreate(
            phoneNumbers.map((phone) => ({
              ...phone,
              contactId: contact.id,
            })),
            { transaction: t }
          );
        }
      }

      // Return the updated contact with all related data
      return await Contact.findByPk(contact.id, {
        include: [
          {
            model: Company,
            as: "company",
          },
          {
            model: ContactEmail,
            as: "emails",
          },
          {
            model: ContactPhone,
            as: "phoneNumbers",
          },
        ],
        transaction: t,
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Delete related records and contact
    await sequelize.transaction(async (t) => {
      await ContactEmail.destroy({
        where: { contactId: req.params.id },
        transaction: t,
      });

      await ContactPhone.destroy({
        where: { contactId: req.params.id },
        transaction: t,
      });

      await contact.destroy({ transaction: t });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
