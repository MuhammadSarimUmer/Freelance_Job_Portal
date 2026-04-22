const prisma = require('../config/prisma');
const uploadService = require('../services/uploadService');

const VALID_AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE'];

const getDevelopers = async (req, res) => {
    try {
        const { status, minExperience } = req.query;
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 300);
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

        const { sortBy } = req.query;

        const [developers, total] = await Promise.all([
            prisma.developer.findMany({
                where: whereClause,
                include: {
                    user: {
                        include: {
                            reviewsReceived: { select: { rating: true } }
                        }
                    },
                    knownTechs: { include: { tech: true } }
                },
                skip,
                take: limit
            }),
            prisma.developer.count({ where: whereClause })
        ]);

        const developersWithRating = developers.map((dev) => {
            const reviews = dev.user?.reviewsReceived || [];
            const avgRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : null;
            return { ...dev, averageRating: avgRating, reviewCount: reviews.length };
        });

        if (sortBy === 'rating') {
            developersWithRating.sort((a, b) => (b.averageRating ?? -1) - (a.averageRating ?? -1));
        }

        res.status(200).json({
            success: true,
            data: developersWithRating,
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
                user: {
                    include: {
                        reviewsReceived: {
                            select: { rating: true },
                            take: 100
                        }
                    }
                },
                knownTechs: { include: { tech: true } }
            }
        });

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer not found' });
        }

        const reviews = developer.user?.reviewsReceived || [];
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

        const developerWithRating = { ...developer, averageRating, reviewCount: reviews.length };

        res.status(200).json({ success: true, data: developerWithRating });
    } catch (error) {
        console.error('GetDeveloperById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateDeveloperMe = async (req, res) => {
    try {
        const { fullName, phoneNumber, hourlyRate, portfolioURL, availabilityStatus, experienceYears, removeProfileImage, cvUrl, removeCv, removePortfolio, bio } = req.body;

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
        if (removePortfolio) {
            developerData.portfolioURL = null;
        } else if (portfolioURL !== undefined) {
            developerData.portfolioURL = portfolioURL;
        }

        if (removeCv) {
            developerData.cvUrl = null;
        } else if (cvUrl !== undefined) {
            developerData.cvUrl = cvUrl;
        }
        if (availabilityStatus !== undefined) developerData.availabilityStatus = availabilityStatus;
        if (experienceYears !== undefined) {
            const parsedYears = Number(experienceYears);
            if (!Number.isInteger(parsedYears)) {
                return res.status(400).json({ success: false, message: 'Invalid experience years' });
            }
            developerData.experienceYears = parsedYears;
        }
        if (bio !== undefined) {
            const trimmed = String(bio).trim();
            developerData.bio = trimmed === '' ? null : trimmed;
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

        const [contractsByStatus, releasedEscrow] = await Promise.all([
            prisma.projectContract.groupBy({
                by: ['status'],
                where: { clientID: id },
                _count: { status: true }
            }),
            prisma.paymentEscrow.aggregate({
                where: {
                    paymentStatus: 'RELEASED',
                    milestone: { contract: { clientID: id } }
                },
                _sum: { depositAmount: true }
            })
        ]);

        const statusMap = {};
        contractsByStatus.forEach((g) => { statusMap[g.status] = g._count.status; });

        const enriched = {
            ...client,
            memberSince: client.user?.registrationDate,
            activeContracts: (statusMap.IN_PROGRESS || 0) + (statusMap.SIGNED || 0),
            completedContracts: statusMap.COMPLETED || 0,
            totalSpent: Number(releasedEscrow._sum.depositAmount || 0)
        };

        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        console.error('GetClientById error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateClientMe = async (req, res) => {
    try {
        const { fullName, phoneNumber, companyName, billingAddress, country, bio, removeProfileImage } = req.body;

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
        if (bio !== undefined) {
            const trimmed = String(bio).trim();
            clientData.bio = trimmed === '' ? null : trimmed;
        }

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