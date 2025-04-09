const Company = require('../models/company.model');

const getCompanies = async (req, res) => {
    const companies = await Company.findAll();
    res.status(200).json(companies);
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

const getCompanyById = async (req, res) => {
    const company = await Company.findByPk(req.params.id);
    res.status(200).json(company);
};

module.exports = {
    getCompanies,
    getCompanyById
};
