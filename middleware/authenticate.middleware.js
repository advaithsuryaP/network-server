const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate incoming requests using JWT.
 * Verifies if the request is from a valid source by checking the token.
 */
const authenticate = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing!' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'your_jwt_secret');

        // Attach the decoded user information to the request object
        console.log('Decoded token Info:', decoded);
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token!' });
    }
};

module.exports = authenticate;
