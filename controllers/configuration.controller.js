const sequelize = require('../config/database');
const Configuration = require('../models/configuration.model');
const { Op } = require('sequelize');

const createConfiguration = async (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.status(400).json({ error: 'Category is required' });
    }
    try {
        const configuration = await Configuration.create({
            label: `New Configuration Entry`,
            description: 'New Description',
            category: category,
            is_hidden: false,
            is_disabled: false
        });

        res.status(201).json(configuration);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getConfigurations = async (req, res) => {
    try {
        const { include_hidden = false, category } = req.query;

        const where = {};
        if (!include_hidden) {
            where.is_hidden = false;
        }
        if (category) {
            where.category = category;
        }

        const configurations = await Configuration.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });
        return res.status(200).json(configurations);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getConfigurationById = async (req, res) => {
    try {
        const configuration = await Configuration.findByPk(req.params.id);
        if (!configuration) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        return res.status(200).json(configuration);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
        return res.status(200).json(configuration);
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: error.message });
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

        return res.status(200).json({ success: true });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: error.message });
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

        return res.status(200).json(configurations);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
