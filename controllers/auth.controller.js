const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials!' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Signin successful!', data: user, token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const signInWithToken = async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ message: 'Access token is required!' });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { id: decoded.id } });

        return res.status(200).json({ message: 'Signin successful!', data: user });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token!' });
    }
};

module.exports = {
    signIn,
    signInWithToken
};
