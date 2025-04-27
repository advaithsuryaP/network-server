const express = require('express');
const companyController = require('../controllers/company.controller');

const router = express.Router();

// Get all contacts with company details
router.get('/', companyController.getCompanies);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
