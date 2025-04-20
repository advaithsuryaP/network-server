const sequelize = require('../config/database');
const Contact = require('../models/contact.model');
const Company = require('../models/company.model');
const { Op } = require('sequelize');

const createContact = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // First create the company
        const company = await Company.create(
            {
                name: req.body.company.name,
                category: req.body.company.category,
                primaryIndustry: req.body.company.primaryIndustry
            },
            { transaction }
        );

        // Then create the contact with the new companyId
        const contact = await Contact.create(
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                title: req.body.title,
                companyId: company.id
            },
            { transaction }
        );

        // Get the full contact data with associations
        const fullContact = await Contact.findByPk(contact.id, {
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ],
            transaction
        });

        await transaction.commit();
        res.status(201).json(fullContact);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ]
        });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id, {
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ]
        });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateContact = async (req, res) => {
    let transaction;
    try {
        const { company, emails, phoneNumbers, ...contactData } = req.body;

        // Start transaction
        transaction = await sequelize.transaction();

        // Find the contact
        const contact = await Contact.findByPk(req.params.id, {
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ],
            transaction
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Handle company update if company data is provided
        if (company) {
            if (contact.company) {
                // Update existing company
                await contact.company.update(company, { transaction });
            } else {
                // Create new company
                const newCompany = await Company.create(company, { transaction });
                contactData.companyId = newCompany.id;
            }
        }

        // Update contact
        await contact.update(
            {
                ...contactData,
                emails: emails || contact.emails,
                phoneNumbers: phoneNumbers || contact.phoneNumbers
            },
            { transaction }
        );

        // Fetch updated contact with company details
        const updatedContact = await Contact.findByPk(contact.id, {
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ],
            transaction
        });

        // Commit transaction
        await transaction.commit();

        res.status(200).json(updatedContact);
    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteContact = async (req, res) => {
    let transaction;
    try {
        // Start transaction
        transaction = await sequelize.transaction();

        // Find the contact without including company to avoid any potential issues
        const contact = await Contact.findByPk(req.params.id, { transaction });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Get the companyId before deleting the contact
        const companyId = contact.companyId;

        // Delete the contact first
        await contact.destroy({ transaction });

        // If there was a companyId, try to delete the company
        if (companyId) {
            try {
                const company = await Company.findByPk(companyId, { transaction });
                if (company) {
                    await company.destroy({ transaction });
                }
            } catch (error) {
                // If company deletion fails, we still want to commit the contact deletion
                console.error('Error deleting company:', error);
            }
        }

        // Commit transaction
        await transaction.commit();

        res.status(200).json({ success: true });
    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const searchContacts = async (req, res) => {
    try {
        const { query } = req.query;

        // If no query, return all contacts
        if (!query || query.trim() === '') {
            const contacts = await Contact.findAll({
                include: [
                    {
                        model: Company,
                        as: 'company'
                    }
                ]
            });
            return res.status(200).json(contacts);
        }

        const contacts = await Contact.findAll({
            where: {
                [Op.or]: [
                    {
                        firstName: {
                            [Op.iLike]: `%${query}%`
                        }
                    },
                    {
                        lastName: {
                            [Op.iLike]: `%${query}%`
                        }
                    }
                ]
            },
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ]
        });

        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact,
    searchContacts
};
