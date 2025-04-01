const sequelize = require('../config/database');
const Contact = require('../models/contact.model');
const Company = require('../models/company.model');

const createContact = async (req, res) => {
    try {
        const { company, emails, phoneNumbers, ...contactData } = req.body;

        // Start a transaction
        const result = await sequelize.transaction(async t => {
            // Create or find company
            let companyRecord;
            if (company.id) {
                companyRecord = await Company.findByPk(company.id);
                if (!companyRecord) {
                    throw new Error('Company not found');
                }
            } else {
                companyRecord = await Company.create(company, { transaction: t });
            }

            // Create contact with company reference and embedded arrays
            const contact = await Contact.create(
                {
                    ...contactData,
                    companyId: companyRecord.id,
                    emails: emails || [],
                    phoneNumbers: phoneNumbers || []
                },
                { transaction: t }
            );

            // Return the created contact with company details
            return await Contact.findByPk(contact.id, {
                include: [
                    {
                        model: Company,
                        as: 'company'
                    }
                ],
                transaction: t
            });
        });

        res.status(201).json(result);
    } catch (error) {
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
    try {
        const { company, emails, phoneNumbers, ...contactData } = req.body;

        // Start a transaction
        const result = await sequelize.transaction(async t => {
            // Find the contact
            const contact = await Contact.findByPk(req.params.id, {
                include: [
                    {
                        model: Company,
                        as: 'company'
                    }
                ],
                transaction: t
            });

            if (!contact) {
                throw new Error('Contact not found');
            }

            // Update or create company
            let companyRecord;
            if (company.id) {
                companyRecord = await Company.findByPk(company.id);
                if (!companyRecord) {
                    throw new Error('Company not found');
                }
            } else {
                companyRecord = await Company.create(company, { transaction: t });
            }

            // Update contact with embedded arrays
            await contact.update(
                {
                    ...contactData,
                    companyId: companyRecord.id,
                    emails: emails || contact.emails,
                    phoneNumbers: phoneNumbers || contact.phoneNumbers
                },
                { transaction: t }
            );

            // Return the updated contact with company details
            return await Contact.findByPk(contact.id, {
                include: [
                    {
                        model: Company,
                        as: 'company'
                    }
                ],
                transaction: t
            });
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Delete contact (emails and phone numbers will be deleted automatically)
        await contact.destroy();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};
