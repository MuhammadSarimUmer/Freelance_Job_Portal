const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const uploadService = require('../services/uploadService');

const USER_SELECT = {
    userID: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    profileImageUrl: true,
    registrationDate: true,
    accountStatus: true
};

const generateToken = (userId, role, expiresIn = '1d') => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn });
};

const TOKEN_BLACKLIST_TTL_DAYS = parseInt(process.env.TOKEN_BLACKLIST_TTL_DAYS || '3', 10);
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {
    try {
        const { fullName, email, password, role, country, phoneNumber } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        let profileImageUrl = null;
        if (req.file) {
            profileImageUrl = await uploadService.uploadToCloud(req.file);
        }

        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    fullName,
                    email,
                    passwordHash,
                    phoneNumber,
                    ...(profileImageUrl ? { profileImageUrl } : {})
                },
                select: USER_SELECT
            });

            if (role === 'DEVELOPER') {
                await tx.developer.create({ data: { userID: newUser.userID, hourlyRate: 0 } });
            } else if (role === 'CLIENT') {
                await tx.client.create({ data: { userID: newUser.userID, country } });
            }

            return newUser;
        });

        const token = generateToken(result.userID, role);

        res.status(201).json({ success: true, token, user: result });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { developer: true, client: true }
        });

        if (!user || user.accountStatus !== 'ACTIVE') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        let role;
        if (user.developer) {
            role = 'DEVELOPER';
        } else if (user.client) {
            role = 'CLIENT';
        } else {
            return res.status(403).json({ success: false, message: 'Account has no assigned role' });
        }

        const token = generateToken(user.userID, role);

        const { passwordHash: _, ...safeUser } = user;
        res.status(200).json({ success: true, token, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userID: req.user.userId },
            select: {
                ...USER_SELECT,
                developer: { include: { knownTechs: { include: { tech: true } } } },
                client: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const refresh = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userID: req.user.userId },
            include: { developer: true, client: true }
        });

        if (!user || user.accountStatus !== 'ACTIVE') {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }

        let role;
        if (user.developer) {
            role = 'DEVELOPER';
        } else if (user.client) {
            role = 'CLIENT';
        } else {
            return res.status(403).json({ success: false, message: 'Account has no assigned role' });
        }

        const token = generateToken(user.userID, role);
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (token) {
            const tokenHash = hashToken(token);
            const expiresAt = new Date(Date.now() + TOKEN_BLACKLIST_TTL_DAYS * 24 * 60 * 60 * 1000);

            await prisma.blacklistedToken.upsert({
                where: { tokenHash },
                create: { tokenHash, expiresAt },
                update: { expiresAt }
            });
        }

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
        }

        const resetToken = jwt.sign(
            { userId: user.userID, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        if (process.env.NODE_ENV === 'development') {
            return res.status(200).json({ success: true, message: 'Reset link sent', devToken: resetToken });
        }

        res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
    } catch (error) {
        console.error('ForgotPassword error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({ success: false, message: 'Invalid reset token' });
        }

        const user = await prisma.user.findUnique({ where: { userID: decoded.userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { userID: decoded.userId },
            data: { passwordHash }
        });

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('ResetPassword error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// const resetPassword = async (req, res) => {
//     try {
//         const { token, newPassword } = req.body;
//
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//         if (decoded.purpose !== 'password-reset') {
//             return res.status(400).json({ success: false, message: 'Invalid reset token' });
//         }
//
//         const salt = await bcrypt.genSalt(12);
//         const passwordHash = await bcrypt.hash(newPassword, salt);
//
//         await prisma.user.update({
//             where: { userID: decoded.userId },
//             data: { passwordHash }
//         });
//
//         res.status(200).json({ success: true, message: 'Password updated successfully' });
//     } catch (error) {
//         console.error('ResetPassword error:', error);
//         if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
//             return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
//         }
//         res.status(500).json({ success: false, message: 'Server error' });
//     }
// };

module.exports = {
    register,
    login,
    getMe,
    refresh,
    logout,
    forgotPassword,
    resetPassword
};

/*
TODO-DEADLINE: Email verification + OTP implementation (DO NOT REMOVE)

const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetOtpEmail } = require('../services/emailService');

const EMAIL_VERIFY_TTL_MINUTES = parseInt(process.env.EMAIL_VERIFY_TTL_MINUTES || '60', 10);
const PASSWORD_RESET_OTP_TTL_MINUTES = parseInt(process.env.PASSWORD_RESET_OTP_TTL_MINUTES || '10', 10);
const MAX_OTP_ATTEMPTS = 5;

// register() with verification token + sendVerificationEmail
// login() with emailVerified gate
// forgotPassword() with OTP storage + sendPasswordResetOtpEmail
// resetPassword(), resendVerification(), verifyEmail()

module.exports = {
    register,
    login,
    getMe,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification,
    verifyEmail
};
*/