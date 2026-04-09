const prisma = require('../config/prisma');

const VALID_AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'UNAVAILABLE'];

const getDevelopers = async (req, res) => {
    try {
        const { status, minExperience } = req.query;
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

        const developers = await prisma.developer.findMany({
            where: whereClause,
            include: {
                user: { select: { fullName: true, email: true } },
                knownTechs: { include: { tech: true } }
            }
        });

        res.status(200).json({ success: true, data: developers });
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
                user: { select: { fullName: true, email: true, registrationDate: true } },
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
        const { fullName, phoneNumber, hourlyRate, portfolioURL, availabilityStatus, experienceYears } = req.body;

        const userData = {};
        if (fullName !== undefined) userData.fullName = fullName;
        if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;

        const developerData = {};
        if (hourlyRate !== undefined) developerData.hourlyRate = hourlyRate;
        if (portfolioURL !== undefined) developerData.portfolioURL = portfolioURL;
        if (availabilityStatus !== undefined) developerData.availabilityStatus = availabilityStatus;
        if (experienceYears !== undefined) developerData.experienceYears = experienceYears;

        const result = await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { userID: req.user.userId },
                    data: userData
                });
            }

            const developer = await tx.developer.update({
                where: { userID: req.user.userId },
                data: developerData,
                include: {
                    user: { select: { fullName: true, email: true, phoneNumber: true } }
                }
            });

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
                user: { select: { fullName: true, registrationDate: true } }
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
        const { fullName, phoneNumber, companyName, billingAddress, country } = req.body;

        const userData = {};
        if (fullName !== undefined) userData.fullName = fullName;
        if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;

        const clientData = {};
        if (companyName !== undefined) clientData.companyName = companyName;
        if (billingAddress !== undefined) clientData.billingAddress = billingAddress;
        if (country !== undefined) clientData.country = country;

        const result = await prisma.$transaction(async (tx) => {
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { userID: req.user.userId },
                    data: userData
                });
            }

            const client = await tx.client.update({
                where: { userID: req.user.userId },
                data: clientData,
                include: {
                    user: { select: { fullName: true, email: true, phoneNumber: true } }
                }
            });

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