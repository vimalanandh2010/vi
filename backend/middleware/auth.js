const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header or query param
    const authHeader = req.header('Authorization');
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
        console.log(`[Auth] Using token from query parameter for ${req.method} ${req.url}`);
    }

    // Check if not token
    if (!token) {
        console.warn(`[Auth] No valid token found in header or query for ${req.method} ${req.url}`);
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error(`[Auth] Token verification failed for ${req.method} ${req.originalUrl}:`, err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
