const express = require('express');
const router = express.Router();
const {
    createConfiguration,
    getConfigurations,
    getConfigurationById,
    updateConfiguration,
    deleteConfiguration,
    searchConfigurations
} = require('../controllers/configuration.controller');

// Create a new configuration
router.post('/', createConfiguration);

// Get all configurations (with optional filters)
router.get('/', getConfigurations);

// Get a specific configuration by ID
router.get('/:id', getConfigurationById);

// Update a configuration
router.put('/:id', updateConfiguration);

// Delete a configuration
router.delete('/:id', deleteConfiguration);

// Search configurations
router.get('/search', searchConfigurations);

module.exports = router;
