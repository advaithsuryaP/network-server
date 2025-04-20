const sequelize = require('../config/database');
const Configuration = require('../models/configuration.model');
const { Op } = require('sequelize');

const createConfiguration = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // Get total count of configurations
        const count = await Configuration.count({ transaction });
        const nextNumber = count + 1;

        const configuration = await Configuration.create(
            {
                label: `New Entry ${nextNumber}`,
                description: 'New Description',
                is_hidden: false,
                is_disabled: false
            },
            { transaction }
        );

        await transaction.commit();
        res.status(201).json(configuration);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const getConfigurations = async (req, res) => {
    try {
        const { include_hidden = false, include_disabled = false } = req.query;

        const where = {};
        if (!include_hidden) {
            where.is_hidden = false;
        }
        if (!include_disabled) {
            where.is_disabled = false;
        }

        const configurations = await Configuration.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });
        res.status(200).json(configurations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getConfigurationById = async (req, res) => {
    try {
        const configuration = await Configuration.findByPk(req.params.id);
        if (!configuration) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.status(200).json(configuration);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateConfiguration = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const configuration = await Configuration.findByPk(req.params.id, { transaction });
        if (!configuration) {
            return res.status(404).json({ error: 'Configuration not found' });
        }

        await configuration.update(
            {
                label: req.body.label,
                description: req.body.description,
                is_hidden: req.body.is_hidden,
                is_disabled: req.body.is_disabled
            },
            { transaction }
        );

        await transaction.commit();
        res.status(200).json(configuration);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteConfiguration = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const configuration = await Configuration.findByPk(req.params.id, { transaction });
        if (!configuration) {
            return res.status(404).json({ error: 'Configuration not found' });
        }

        await configuration.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({ success: true });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ error: error.message });
    }
};

const searchConfigurations = async (req, res) => {
    try {
        const { query } = req.query;
        const { include_hidden = false, include_disabled = false } = req.query;

        const where = {
            [Op.or]: [
                {
                    label: {
                        [Op.iLike]: `%${query}%`
                    }
                },
                {
                    description: {
                        [Op.iLike]: `%${query}%`
                    }
                }
            ]
        };

        if (!include_hidden) {
            where.is_hidden = false;
        }
        if (!include_disabled) {
            where.is_disabled = false;
        }

        const configurations = await Configuration.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(configurations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createConfiguration,
    getConfigurations,
    getConfigurationById,
    updateConfiguration,
    deleteConfiguration,
    searchConfigurations
};
