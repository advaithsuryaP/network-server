const sequelize = require('../config/database');
const Contact = require('../models/contact.model');
const Company = require('../models/company.model');
const { Op } = require('sequelize');

const createContact = async (req, res) => {
    let transaction;
    try {
        // Start transaction
        transaction = await sequelize.transaction();

        // Create default company
        const defaultCompany = await Company.create(
            {
                name: 'New Company',
                description: 'Default company for new contact',
                category: 'startup',
                primaryIndustry: 'Technology',
                attractedOutOfState: false,
                confidentialityRequested: false,
                intellectualProperty: 'None',
                departmentIfFaculty: 'N/A'
            },
            { transaction }
        );

        // Create contact with default values
        const defaultContact = await Contact.create(
            {
                firstName: 'New',
                lastName: 'Contact',
                title: 'Not Specified',
                notes: '',
                companyId: defaultCompany.id,
                emails: [],
                phoneNumbers: []
            },
            { transaction }
        );

        // Fetch the created contact with company details
        const contact = await Contact.findByPk(defaultContact.id, {
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

        res.status(201).json(contact);
    } catch (error) {
        // Rollback transaction on error
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
        res.json(contacts);
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
        res.json(contact);
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

        if (!contact.company) {
            return res.status(404).json({ error: 'Associated company not found' });
        }

        // Update the existing company
        await contact.company.update(company, { transaction });

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

        res.json(updatedContact);
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

        const contact = await Contact.findByPk(req.params.id, { transaction });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Delete contact
        await contact.destroy({ transaction });

        // Commit transaction
        await transaction.commit();

        res.json({ success: true });
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
            return res.json(contacts);
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

        res.json(contacts);
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
