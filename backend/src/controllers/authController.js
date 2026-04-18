const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const uploadService = require('../services/uploadService');
const { sendVerificationEmail, sendPasswordResetOtpEmail } = require('../services/emailService');

const USER_SELECT = {
    userID: true,
    fullName: true,
    email: true,
    phoneNumber: true,
    profileImageUrl: true,
    registrationDate: true,
    accountStatus: true,
    emailVerified: true,
    emailVerifiedAt: true
};

const generateToken = (userId, role, expiresIn = '1d') => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn });
};

const TOKEN_BLACKLIST_TTL_DAYS = parseInt(process.env.TOKEN_BLACKLIST_TTL_DAYS || '3', 10);
const EMAIL_VERIFY_TTL_MINUTES = parseInt(process.env.EMAIL_VERIFY_TTL_MINUTES || '60', 10);
const PASSWORD_RESET_OTP_TTL_MINUTES = parseInt(process.env.PASSWORD_RESET_OTP_TTL_MINUTES || '10', 10);
const MAX_OTP_ATTEMPTS = parseInt(process.env.PASSWORD_RESET_OTP_MAX_ATTEMPTS || '5', 10);
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createEmailVerificationToken = () => crypto.randomBytes(32).toString('hex');
const createOtpCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const register = async (req, res) => {
    try {
        const { fullName, email, password, role, country, phoneNumber } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = createEmailVerificationToken();
        const verificationTokenHash = hashToken(verificationToken);
        const verificationTokenExpires = new Date(Date.now() + EMAIL_VERIFY_TTL_MINUTES * 60 * 1000);

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
                    emailVerificationToken: verificationTokenHash,
                    emailVerificationTokenExpires: verificationTokenExpires,
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

        let emailSent = false;
        try {
            await sendVerificationEmail(email, fullName, verificationToken);
            emailSent = true;
        } catch (error) {
            console.error('Send verification email error:', error);
        }

        const responsePayload = {
            success: true,
            message: emailSent
                ? 'Verification email sent. Please verify to activate your account.'
                : 'Account created. Please request a new verification email to activate your account.',
            user: result,
            requiresVerification: true
        };

        if (process.env.NODE_ENV === 'development') {
            responsePayload.devVerificationToken = verificationToken;
        }

        res.status(201).json(responsePayload);
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

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please verify your email to continue.'
            });
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

        const {
            passwordHash: _,
            emailVerificationToken: __,
            emailVerificationTokenExpires: ___,
            ...safeUser
        } = user;
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

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please verify your email to continue.'
            });
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

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Email not verified. Please verify your email to continue.'
            });
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
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a reset code has been sent'
            });
        }

        const otp = createOtpCode();
        const otpHash = hashToken(otp);
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MINUTES * 60 * 1000);

        await prisma.passwordResetOtp.create({
            data: {
                userID: user.userID,
                otpHash,
                expiresAt
            }
        });

        let emailSent = false;
        try {
            await sendPasswordResetOtpEmail(user.email, user.fullName, otp, PASSWORD_RESET_OTP_TTL_MINUTES);
            emailSent = true;
        } catch (error) {
            console.error('Send password reset OTP error:', error);
        }

        const responsePayload = {
            success: true,
            message: emailSent
                ? 'If that email exists, a reset code has been sent'
                : 'Unable to send reset code right now. Please try again later.'
        };

        if (process.env.NODE_ENV === 'development') {
            responsePayload.devOtp = otp;
        }

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('ForgotPassword error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        const otpRecord = await prisma.passwordResetOtp.findFirst({
            where: {
                userID: user.userID,
                usedAt: null,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        const otpHash = hashToken(String(otp));
        if (otpHash !== otpRecord.otpHash) {
            const nextAttempts = otpRecord.attempts + 1;
            const updateData = { attempts: nextAttempts };
            if (nextAttempts >= MAX_OTP_ATTEMPTS) {
                updateData.usedAt = new Date();
            }

            await prisma.passwordResetOtp.update({
                where: { otpID: otpRecord.otpID },
                data: updateData
            });

            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { userID: user.userID },
                data: { passwordHash }
            });
            await tx.passwordResetOtp.update({
                where: { otpID: otpRecord.otpID },
                data: { usedAt: new Date(), attempts: otpRecord.attempts + 1 }
            });
        });

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('ResetPassword error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a verification email has been sent.'
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({ success: true, message: 'Email is already verified.' });
        }

        const verificationToken = createEmailVerificationToken();
        const verificationTokenHash = hashToken(verificationToken);
        const verificationTokenExpires = new Date(Date.now() + EMAIL_VERIFY_TTL_MINUTES * 60 * 1000);

        await prisma.user.update({
            where: { userID: user.userID },
            data: {
                emailVerificationToken: verificationTokenHash,
                emailVerificationTokenExpires: verificationTokenExpires
            }
        });

        let emailSent = false;
        try {
            await sendVerificationEmail(user.email, user.fullName, verificationToken);
            emailSent = true;
        } catch (error) {
            console.error('Resend verification email error:', error);
        }

        const responsePayload = {
            success: true,
            message: emailSent
                ? 'Verification email sent. Please check your inbox.'
                : 'Unable to send verification email right now. Please try again later.'
        };

        if (process.env.NODE_ENV === 'development') {
            responsePayload.devVerificationToken = verificationToken;
        }

        return res.status(200).json(responsePayload);
    } catch (error) {
        console.error('ResendVerification error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token || req.body.token;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required' });
        }

        const tokenHash = hashToken(token);
        const user = await prisma.user.findFirst({
            where: {
                emailVerificationToken: tokenHash,
                emailVerificationTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        await prisma.user.update({
            where: { userID: user.userID },
            data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
                emailVerificationToken: null,
                emailVerificationTokenExpires: null
            }
        });

        return res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('VerifyEmail error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
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
    resetPassword,
    resendVerification,
    verifyEmail
};

/*
TODO-DEADLINE: OTP implementation (DO NOT REMOVE)

const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetOtpEmail } = require('../services/emailService');

const EMAIL_VERIFY_TTL_MINUTES = parseInt(process.env.EMAIL_VERIFY_TTL_MINUTES || '60', 10);
const PASSWORD_RESET_OTP_TTL_MINUTES = parseInt(process.env.PASSWORD_RESET_OTP_TTL_MINUTES || '10', 10);
const MAX_OTP_ATTEMPTS = 5;

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