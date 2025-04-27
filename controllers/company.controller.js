const Company = require('../models/company.model');
const Contact = require('../models/contact.model');

const getCompanies = async (req, res) => {
    const category = req.query.category;
    try {
        const queryOptions = {
            include: [
                {
                    model: Contact,
                    as: 'contacts',
                    attributes: ['id']
                }
            ],
            order: [['name', 'ASC']]
        };

        if (category) {
            queryOptions.where = { category };
        }

        const companies = await Company.findAll(queryOptions);

        // Transform the response to include only contact IDs as strings
        const transformedCompanies = companies.map(company => ({
            ...company.toJSON(),
            contacts: company.contacts.map(contact => contact.id)
        }));

        return res.status(200).json(transformedCompanies);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id, {
            include: [
                {
                    model: Contact,
                    as: 'contacts',
                    attributes: ['id']
                }
            ]
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Transform the response to include only contact IDs as strings
        const transformedCompany = {
            ...company.toJSON(),
            contacts: company.contacts.map(contact => contact.id)
        };

        return res.status(200).json(transformedCompany);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id, {
            include: [
                {
                    model: Contact,
                    as: 'contacts'
                }
            ]
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Check if company has any contacts
        if (company.contacts && company.contacts.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete company with associated contacts. Please delete the contacts first.'
            });
        }

        // Only delete if company has no contacts
        await company.destroy();
        return res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCompanies,
    getCompanyById,
    deleteCompany
};
