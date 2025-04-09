const Company = require('../models/company.model');

const getCompanies = async (req, res) => {
    const category = req.query.category;
    if (category) {
        const companies = await Company.findAll({
            where: {
                category: category
            }
        });
        res.status(200).json(companies);
    } else {
        const companies = await Company.findAll();
        res.status(200).json(companies);
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
