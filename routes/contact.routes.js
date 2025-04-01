const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact.controller');

// Get all contacts with company details
router.get('/', contactController.getContacts);

// Get contact by ID with company details
router.get('/:id', contactController.getContactById);

// Create new contact
router.post('/', contactController.createContact);

// Update contact
router.patch('/:id', contactController.updateContact);

// Delete contact
router.delete('/:id', contactController.deleteContact);

module.exports = router;
