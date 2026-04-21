const prisma = require('../config/prisma');

const createApplication = async (req, res) => {
    try {
        const { appName, appType, description, currentVersion } = req.body;

        const app = await prisma.application.create({
            data: {
                appName,
                appType,
                description: description || null,
                currentVersion: currentVersion || '1.0.0'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Application created successfully',
            data: app
        });

    } catch (error) {
        console.error('CreateApplication error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        let whereClause = {};
        let contractScope = {};

        if (role === 'CLIENT') {
            const client = await prisma.client.findUnique({
                where: { userID: userId },
                select: { clientID: true }
            });

            if (!client) {
                return res.status(404).json({ success: false, message: 'Client profile not found' });
            }

            whereClause = { contracts: { some: { clientID: client.clientID } } };
            contractScope = { clientID: client.clientID };
        }

        if (role === 'DEVELOPER') {
            const developer = await prisma.developer.findUnique({
                where: { userID: userId },
                select: { developerID: true }
            });

            if (!developer) {
                return res.status(404).json({ success: false, message: 'Developer profile not found' });
            }

            whereClause = {
                contracts: {
                    some: { assignments: { some: { developerID: developer.developerID } } }
                }
            };
            contractScope = {
                assignments: { some: { developerID: developer.developerID } }
            };
        }

        const apps = await prisma.application.findMany({
            where: whereClause,
            include: {
                contracts: {
                    where: contractScope
                }
            }
        });

        res.status(200).json({
            success: true,
            data: apps
        });

    } catch (error) {
        console.error('GetApplications error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;
        let accessClause = {};
        let contractScope = {};

        if (role === 'CLIENT') {
            const client = await prisma.client.findUnique({
                where: { userID: userId },
                select: { clientID: true }
            });

            if (!client) {
                return res.status(404).json({ success: false, message: 'Client profile not found' });
            }

            accessClause = { contracts: { some: { clientID: client.clientID } } };
            contractScope = { clientID: client.clientID };
        }

        if (role === 'DEVELOPER') {
            const developer = await prisma.developer.findUnique({
                where: { userID: userId },
                select: { developerID: true }
            });

            if (!developer) {
                return res.status(404).json({ success: false, message: 'Developer profile not found' });
            }

            accessClause = {
                contracts: {
                    some: { assignments: { some: { developerID: developer.developerID } } }
                }
            };
            contractScope = { assignments: { some: { developerID: developer.developerID } } };
        }

        const app = await prisma.application.findFirst({
            where: { appID: id, ...accessClause },
            include: {
                contracts: {
                    where: contractScope,
                    include: {
                        client: true,
                        assignments: true,
                        technologies: true
                    }
                }
            }
        });

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(200).json({
            success: true,
            data: app
        });

    } catch (error) {
        console.error('GetApplicationById error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { appName, appType, description, currentVersion } = req.body;
        const userId = req.user.userId;

        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const ownsApp = await prisma.projectContract.findFirst({
            where: { appID: id, clientID: client.clientID }
        });

        if (!ownsApp) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const updated = await prisma.application.update({
            where: { appID: id },
            data: {
                ...(appName !== undefined && { appName }),
                ...(appType !== undefined && { appType }),
                ...(description !== undefined && { description }),
                ...(currentVersion !== undefined && { currentVersion })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Application updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateApplication error:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const ownsApp = await prisma.projectContract.findFirst({
            where: { appID: id, clientID: client.clientID }
        });

        if (!ownsApp) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const contractExists = await prisma.projectContract.findFirst({
            where: { appID: id }
        });

        if (contractExists) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete application with active contracts'
            });
        }

        await prisma.application.delete({
            where: { appID: id }
        });

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('DeleteApplication error:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (error.code === 'P2003') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete due to related records'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
};