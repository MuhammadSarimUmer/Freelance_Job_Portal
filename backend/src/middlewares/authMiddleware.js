const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tokenHash = hashToken(token);
        const blacklisted = await prisma.blacklistedToken.findFirst({
            where: {
                tokenHash,
                expiresAt: { gt: new Date() }
            }
        });

        if (blacklisted) {
            return res.status(401).json({ success: false, message: 'Token revoked' });
        }

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

const requireProfileImage = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userID: req.user.userId },
            select: { profileImageUrl: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.profileImageUrl) {
            return res.status(403).json({
                success: false,
                message: 'Profile image required to perform this action'
            });
        }

        next();
    } catch (error) {
        console.error('RequireProfileImage error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    verifyToken,
    requireDeveloper,
    requireClient,
    requireRoles,
    requireProfileImage
};