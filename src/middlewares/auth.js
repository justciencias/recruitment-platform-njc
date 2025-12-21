const jwt = require('jsonwebtoken');

/**
 * Middleware to verify if the user is authenticated and has the required access level
 * @param {number} requiredLevel - Minimum level needed (1: Read, 2: Edit/Feedback, 3: Admin)
 */
const authorize = (requiredLevel = 1) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (req.user.access_level < requiredLevel) {
                return res.status(403).json({ error: 'Access denied: insufficient permissions' });
            }

            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};

module.exports = authorize;