const auth = require('./auth');

module.exports = function (req, res, next) {
    auth(req, res, () => {
        if (req.user && req.user.role === 'employer') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. recruiters only.' });
        }
    });
};
