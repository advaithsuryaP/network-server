const Company = require('../models/company.model');
const Contact = require('../models/contact.model');

const getCompanies = async (req, res) => {
    const category = req.query.category;
    try {
        if (category) {
            const companies = await Company.findAll({
                where: {
                    category: category
                },
                include: [
                    {
                        model: Contact,
                        as: 'contacts'
                    }
                ]
            });
            res.status(200).json(companies);
        } else {
            const companies = await Company.findAll({
                include: [
                    {
                        model: Contact,
                        as: 'contacts'
                    }
                ]
            });
            res.status(200).json(companies);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCompanyById = async (req, res) => {
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
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCompanies,
    getCompanyById
};
