const express = require('express');
const contactController = require('../controllers/contact.controller');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

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

router.post('/upload', upload.single('file'), contactController.uploadContacts);

module.exports = router;
