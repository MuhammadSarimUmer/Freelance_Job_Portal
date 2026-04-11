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
        const apps = await prisma.application.findMany({
            include: {
                contracts: true
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

        const app = await prisma.application.findUnique({
            where: { appID: id },
            include: {
                contracts: {
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