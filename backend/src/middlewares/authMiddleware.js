const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

const requireDeveloper = (req, res, next) => {
    if (req.user.role !== 'DEVELOPER') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};

const requireClient = (req, res, next) => {
    if (req.user.role !== 'CLIENT') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};

const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    requireDeveloper,
    requireClient,
    requireRoles
};