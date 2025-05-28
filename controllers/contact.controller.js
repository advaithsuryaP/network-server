const fs = require('fs');
const xlsx = require('xlsx');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const Contact = require('../models/contact.model');
const Company = require('../models/company.model');
const Configuration = require('../models/configuration.model');

const { CONFIGURATION_KEYS, UPLOAD_STATUS_KEYS } = require('../constants/app.keys');

const createContact = async (req, res) => {
    const {
        avatar,
        firstName,
        lastName,
        title,
        university,
        emails,
        major,
        phoneNumbers,
        notes,
        isAlumni,
        isContestWinner,
        company
    } = req.body;

    if (!firstName || !lastName || !title || !university) {
        return res.status(400).json({ error: 'First name, last name, title and university are required' });
    }

    if (!emails || emails.length === 0) {
        return res.status(400).json({ error: 'At least one email is required' });
    }

    if (!phoneNumbers || phoneNumbers.length === 0) {
        return res.status(400).json({ error: 'At least one phone number is required' });
    }

    const transaction = await sequelize.transaction();
    try {
        const contactData = {
            avatar,
            firstName,
            lastName,
            title,
            university,
            major,
            notes,
            emails,
            phoneNumbers,
            isAlumni,
            isContestWinner
        };

        if (company) {
            // If company data is provided, create/associate company
            const { name, category, primaryIndustry } = company;

            if (!name || !category || !primaryIndustry) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Company data is required' });
            }

            const newCompany = await Company.create(
                {
                    name: name,
                    category: category,
                    primaryIndustry: primaryIndustry
                },
                { transaction }
            );
            contactData.companyId = newCompany.id;
        }

        // Create the contact
        const contact = await Contact.create(contactData, { transaction });

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
        return res.status(201).json(fullContact);
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return res.status(500).json({ error: error.message });
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
        return res.status(200).json(contacts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
        return res.status(200).json(contact);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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

        return res.status(200).json(updatedContact);
    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: error.message });
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

        return res.status(200).json({ success: true });
    } catch (error) {
        // Rollback transaction on error
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: error.message });
    }
};

// Bulk create contacts from a CSV file
const uploadContacts = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Fetch all configuration entries once
        const configurations = await Configuration.findAll();

        const getConfigId = (category, label) => {
            const configurationResult = configurations.find(
                configurationRecord =>
                    configurationRecord.category === category &&
                    configurationRecord.label.trim().toLowerCase() === label.trim().toLowerCase()
            );
            return configurationResult ? configurationResult.id : null;
        };

        const parseBoolean = value => value?.toString().toUpperCase() === 'TRUE';

        const defaultLabelId = getConfigId(CONFIGURATION_KEYS.CONTACT_LABELS, 'Personal');
        if (!defaultLabelId) {
            throw new Error('Personal label configuration not found.');
        }

        const createdContacts = [];

        for (const [index, row] of data.entries()) {
            // Skip if upload status is already completed
            if (row['Upload Status'] === UPLOAD_STATUS_KEYS.COMPLETED) {
                continue;
            }

            // Mandatory Fields Validation
            if (
                !row['First Name'] ||
                !row['Last Name'] ||
                !row['Title'] ||
                !row['University'] ||
                !row['Emails'] ||
                !row['Phone Numbers'] ||
                !row['Is Alumni'] ||
                !row['Is Contest Winner']
            ) {
                throw new Error(`Missing mandatory contact fields at row ${index + 2}`);
            }

            if (!row['Company Name']) {
                throw new Error(`Missing mandatory company fields at row ${index + 2}`);
            }

            // Parse Emails
            const emailsArray = (row['Emails'] || '')
                .toString()
                .split(',')
                .map(email => email.trim())
                .filter(email => email.length > 0)
                .map(email => ({ email, label: defaultLabelId }));

            // Parse Phone Numbers
            const phoneNumbersArray = (row['Phone Numbers'] || '')
                .toString()
                .split(',')
                .map(phone => phone.trim())
                .filter(phone => phone.length > 0)
                .map(phoneNumber => ({
                    phoneNumber,
                    countryCode: 'us', // hardcoded
                    label: defaultLabelId
                }));

            // Fetch UUIDs for dropdown fields
            const companyCategoryId = getConfigId(CONFIGURATION_KEYS.COMPANY_CATEGORY, row['Company Category']);
            if (!companyCategoryId) {
                throw new Error(`Invalid company category at row ${index + 2}: ${row['Company Category']}`);
            }

            const primaryIndustryId = getConfigId(CONFIGURATION_KEYS.PRIMARY_INDUSTRY, row['Company Primary Industry']);
            if (!primaryIndustryId) {
                throw new Error(`Invalid primary industry at row ${index + 2}: ${row['Company Primary Industry']}`);
            }

            const universityId = getConfigId(CONFIGURATION_KEYS.NETWORK_UNIVERSITY, row['University']);
            if (!universityId) {
                throw new Error(`Invalid university at row ${index + 2}: ${row['University']}`);
            }

            // Create Company
            const newCompany = await Company.create({
                name: row['Company Name'].trim(),
                description: row['Company Description']?.trim() || null,
                website: row['Company Website']?.trim() || null,
                category: companyCategoryId,
                primaryIndustry: primaryIndustryId,
                intellectualProperty: row['Company Intellectual Property']?.trim() || null,
                fundingReceived: row['Company Funding Received'] || null
            });

            // Create Contact
            const newContact = await Contact.create({
                avatar: null,
                background: null,
                firstName: row['First Name'].trim(),
                lastName: row['Last Name'].trim(),
                university: universityId,
                major: row['Major']?.trim() || null,
                notes: row['Notes']?.trim() || null,
                title: row['Title'].trim(),
                companyId: newCompany.id,
                emails: emailsArray,
                phoneNumbers: phoneNumbersArray,
                isAlumni: parseBoolean(row['Is Alumni']),
                isContestWinner: parseBoolean(row['Is Contest Winner'])
            });

            createdContacts.push(newContact);
        }

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        if (createdContacts.length === 0) {
            return res.status(200).json({ message: 'No new contacts created', data: [] });
        }

        return res.status(200).json({ message: 'Contacts uploaded successfully', data: createdContacts });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // ensure cleanup even on error
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContact,
    uploadContacts,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};
