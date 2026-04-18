const prisma = require('../config/prisma');
const uploadService = require('../services/uploadService');

const VALID_AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE'];

const getDevelopers = async (req, res) => {
    try {
        const { status, minExperience } = req.query;
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
        const skip = (page - 1) * limit;
        const whereClause = {};

        if (status) {
            if (!VALID_AVAILABILITY_STATUSES.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid availability status' });
            }
            whereClause.availabilityStatus = status;
        }

        if (minExperience) {
            const parsed = parseInt(minExperience, 10);
            if (isNaN(parsed) || parsed < 0) {
                return res.status(400).json({ success: false, message: 'Invalid minExperience value' });
            }
            whereClause.experienceYears = { gte: parsed };
        }

        const [developers, total] = await Promise.all([
            prisma.developer.findMany({
                where: whereClause,
                include: {
                    user: { select: { fullName: true, email: true, profileImageUrl: true } },
                    knownTechs: { include: { tech: true } }
                },
                skip,
                take: limit
            }),
            prisma.developer.count({ where: whereClause })
        ]);

        res.status(200).json({
            success: true,
            data: developers,
            meta: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('GetDevelopers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getDeveloperById = async (req, res) => {
    try {
        const { id } = req.params;

        const developer = await prisma.developer.findUnique({
            where: { developerID: id },
            include: {
                user: { select: { fullName: true, email: true, registrationDate: true, profileImageUrl: true } },
                knownTechs: { include: { tech: true } }
            }
        });

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer not found' });
        }

        res.status(200).json({ success: true, data: developer });
    } catch (error) {
        console.error('GetDeveloperById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateDeveloperMe = async (req, res) => {
    try {
        const { fullName, phoneNumber, hourlyRate, portfolioURL, availabilityStatus, experienceYears, removeProfileImage, cvUrl } = req.body;

        const userData = {};
        if (fullName !== undefined) userData.fullName = fullName;
        if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;
        if (removeProfileImage && req.file) {
            return res.status(400).json({ success: false, message: 'Cannot upload and remove profile image in the same request' });
        }

        if (removeProfileImage) {
            userData.profileImageUrl = null;
        } else if (req.file) {
            const fileUrl = await uploadService.uploadToCloud(req.file);
            userData.profileImageUrl = fileUrl;
        }

        const developerData = {};
        if (hourlyRate !== undefined) {
            const parsedRate = Number(hourlyRate);
            if (Number.isNaN(parsedRate)) {
                return res.status(400).json({ success: false, message: 'Invalid hourly rate' });
            }
            developerData.hourlyRate = parsedRate;
        }
        if (portfolioURL !== undefined) developerData.portfolioURL = portfolioURL;
        if (cvUrl !== undefined) developerData.cvUrl = cvUrl;
        if (availabilityStatus !== undefined) developerData.availabilityStatus = availabilityStatus;
        if (experienceYears !== undefined) {
            const parsedYears = Number(experienceYears);
            if (!Number.isInteger(parsedYears)) {
                return res.status(400).json({ success: false, message: 'Invalid experience years' });
            }
            developerData.experienceYears = parsedYears;
        }

        const hasUserUpdates = Object.keys(userData).length > 0;
        const hasDeveloperUpdates = Object.keys(developerData).length > 0;

        if (!hasUserUpdates && !hasDeveloperUpdates) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }

        const result = await prisma.$transaction(async (tx) => {
            if (hasUserUpdates) {
                await tx.user.update({
                    where: { userID: req.user.userId },
                    data: userData
                });
            }

            const developer = hasDeveloperUpdates
                ? await tx.developer.update({
                    where: { userID: req.user.userId },
                    data: developerData,
                    include: {
                        user: { select: { fullName: true, email: true, phoneNumber: true, profileImageUrl: true } }
                    }
                })
                : await tx.developer.findUnique({
                    where: { userID: req.user.userId },
                    include: {
                        user: { select: { fullName: true, email: true, phoneNumber: true, profileImageUrl: true } }
                    }
                });

            if (!developer) {
                const error = new Error('Developer profile not found');
                error.code = 'P2025';
                throw error;
            }

            return developer;
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('UpdateDeveloperMe error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await prisma.client.findUnique({
            where: { clientID: id },
            include: {
                user: { select: { fullName: true, registrationDate: true, profileImageUrl: true } }
            }
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.status(200).json({ success: true, data: client });
    } catch (error) {
        console.error('GetClientById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateClientMe = async (req, res) => {
    try {
        const { fullName, phoneNumber, companyName, billingAddress, country, removeProfileImage } = req.body;

        const userData = {};
        if (fullName !== undefined) userData.fullName = fullName;
        if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;
        if (removeProfileImage && req.file) {
            return res.status(400).json({ success: false, message: 'Cannot upload and remove profile image in the same request' });
        }

        if (removeProfileImage) {
            userData.profileImageUrl = null;
        } else if (req.file) {
            const fileUrl = await uploadService.uploadToCloud(req.file);
            userData.profileImageUrl = fileUrl;
        }

        const clientData = {};
        if (companyName !== undefined) clientData.companyName = companyName;
        if (billingAddress !== undefined) clientData.billingAddress = billingAddress;
        if (country !== undefined) clientData.country = country;

        const hasUserUpdates = Object.keys(userData).length > 0;
        const hasClientUpdates = Object.keys(clientData).length > 0;

        if (!hasUserUpdates && !hasClientUpdates) {
            return res.status(400).json({ success: false, message: 'Nothing to update' });
        }

        const result = await prisma.$transaction(async (tx) => {
            if (hasUserUpdates) {
                await tx.user.update({
                    where: { userID: req.user.userId },
                    data: userData
                });
            }

            const client = hasClientUpdates
                ? await tx.client.update({
                    where: { userID: req.user.userId },
                    data: clientData,
                    include: {
                        user: { select: { fullName: true, email: true, phoneNumber: true, profileImageUrl: true } }
                    }
                })
                : await tx.client.findUnique({
                    where: { userID: req.user.userId },
                    include: {
                        user: { select: { fullName: true, email: true, phoneNumber: true, profileImageUrl: true } }
                    }
                });

            if (!client) {
                const error = new Error('Client profile not found');
                error.code = 'P2025';
                throw error;
            }

            return client;
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('UpdateClientMe error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteUserMe = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { userID: req.user.userId }
        });

        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('DeleteUserMe error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (error.code === 'P2003') {
            return res.status(409).json({ success: false, message: 'Cannot delete account with active contracts' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getDevelopers,
    getDeveloperById,
    updateDeveloperMe,
    getClientById,
    updateClientMe,
    deleteUserMe
};