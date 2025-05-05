const User = require('../models/user.model');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { name, email, password, avatar, tenantName, tenantDescription, tenantCategory, tenantLogo } = req.body;
    if (!name || !email || !password || !tenantName || !tenantCategory || !tenantDescription || !tenantLogo) {
        return res.status(400).json({ message: 'Some mandatory fields are missing!' });
    }

    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email }, { tenantName: tenantName }]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already exists!' });
            }
            if (existingUser.tenantName === tenantName) {
                return res.status(400).json({ message: 'Tenant name already exists!' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            avatar,
            password: hashedPassword,
            tenantName,
            tenantDescription,
            tenantCategory,
            tenantLogo
        });

        res.status(201).json({ message: 'User created successfully!', data: user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser
};
