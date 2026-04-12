const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

const VALID_PROFICIENCY_LEVEL = [
    'BEGINNER',
    'INTERMEDIATE',
    'EXPERT'
];

const createContract = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            appID,
            title,
            description,
            startDate,
            endDate,
            totalAmount
        } = req.body;

        const amount = new Prisma.Decimal(totalAmount);

        const client = await prisma.client.findUnique({
            where: { userID: userId }
        });

        const contract = await prisma.projectContract.create({
            data: {
                clientID: client.clientID,
                appID,
                title: title.trim(),
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                totalAmount: amount,
                status: 'DRAFT'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Contract created successfully',
            data: contract
        });

    } catch (error) {
        console.error('CreateContract error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getContracts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let whereClause = {};

        if (role === 'CLIENT') {
            const client = await prisma.client.findUnique({
                where: { userID: userId },
                select: { clientID: true }
            });

            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client profile not found'
                });
            }

            whereClause.clientID = client.clientID;
        }

        if (role === 'DEVELOPER') {
            whereClause.assignments = {
                some: { developerID: userId }
            };
        }

        const contracts = await prisma.projectContract.findMany({
            where: whereClause,
            include: {
                client: true,
                application: true,
                assignments: {
                    include: {
                        developer: true
                    }
                },
                technologies: true,
                milestones: true,
                bugReports: true
            }
        });

        return res.status(200).json({
            success: true,
            data: contracts
        });

    } catch (error) {
        console.error('GetContracts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getContractById = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            include: {
                client: true,
                application: true,
                assignments: {
                    include: { developer: true }
                },
                technologies: true,
                milestones: true,
                bugReports: true
            }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        return res.status(200).json({ success: true, data: contract });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateContract = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        if (existing.status !== 'DRAFT') {
            return res.status(400).json({
                success: false,
                message: 'Only DRAFT contracts can be updated'
            });
        }

        const allowedFields = [
            'title',
            'description',
            'startDate',
            'endDate',
            'totalAmount'
        ];

        let updateData = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'startDate' || key === 'endDate') {
                    updateData[key] = new Date(req.body[key]);
                } else if (key === 'totalAmount') {
                    updateData[key] = new Prisma.Decimal(req.body[key]);
                } else if (key === 'title') {
                    updateData[key] = req.body[key].trim();
                } else {
                    updateData[key] = req.body[key];
                }
            }
        }

        const updated = await prisma.projectContract.update({
            where: { contractID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Contract updated successfully',
            data: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateContractStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        const updated = await prisma.projectContract.update({
            where: { contractID: id },
            data: { status }
        });

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addContractTech = async (req, res) => {
    try {
        const { id } = req.params;
        const { techID, requiredLevel, purpose } = req.body;

        if (!techID || !requiredLevel) {
            return res.status(400).json({
                success: false,
                message: 'techID and requiredLevel are required'
            });
        }

        if (!VALID_PROFICIENCY_LEVEL.includes(requiredLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid proficiency level'
            });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        const existing = await prisma.contractTechnology.findUnique({
            where: {
                contractID_techID: {
                    contractID: id,
                    techID
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Technology already added to this contract'
            });
        }

        const tech = await prisma.contractTechnology.create({
            data: {
                contractID: id,
                techID,
                requiredLevel,
                purpose
            }
        });

        return res.status(201).json({ success: true, data: tech });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const assignDeveloper = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            developerID,
            role,
            contributionPercentage,
            paymentShare
        } = req.body;

        if (!developerID || !role) {
            return res.status(400).json({
                success: false,
                message: 'developerID and role are required'
            });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        const developer = await prisma.developer.findUnique({
            where: { developerID }
        });

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer not found'
            });
        }

        const cp = Number(contributionPercentage || 0);
        const ps = Number(paymentShare || 0);

        if (isNaN(cp) || isNaN(ps)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid numeric values'
            });
        }

        const existing = await prisma.contractAssignment.findUnique({
            where: {
                developerID_contractID: {
                    developerID,
                    contractID: id
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Developer already assigned to this contract'
            });
        }

        const assignment = await prisma.contractAssignment.create({
            data: {
                contractID: id,
                developerID,
                role,
                contributionPercentage: new Prisma.Decimal(cp),
                paymentShare: new Prisma.Decimal(ps)
            }
        });

        return res.status(201).json({
            success: true,
            data: assignment
        });

    } catch (error) {
        console.error('AssignDeveloper error:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const deleteContract = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        await prisma.projectContract.delete({
            where: { contractID: id }
        });

        return res.status(200).json({
            success: true,
            message: 'Contract deleted successfully'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'P2003') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete contract with active relations'
            });
        }

        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createContract,
    getContracts,
    getContractById,
    updateContract,
    updateContractStatus,
    addContractTech,
    assignDeveloper,
    deleteContract
};