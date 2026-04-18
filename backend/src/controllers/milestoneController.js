const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

const VALID_MILESTONE_STATUS = [
    'PENDING',
    'IN_PROGRESS',
    'IN_REVIEW',
    'COMPLETED'
];

// Helper: verify the requesting user owns the contract that a milestone belongs to
const verifyMilestoneOwnership = async (milestoneID, userId) => {
    const milestone = await prisma.milestone.findUnique({
        where: { milestoneID },
        include: {
            contract: { select: { clientID: true } }
        }
    });

    if (!milestone) return { error: 'Milestone not found', status: 404 };

    const client = await prisma.client.findUnique({
        where: { userID: userId },
        select: { clientID: true }
    });

    if (!client || milestone.contract.clientID !== client.clientID) {
        return { error: 'Forbidden - You do not own this contract', status: 403 };
    }

    return { milestone, client };
};

const createMilestone = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { contractID, title, description, dueDate, milestoneAmount } = req.body;

        // Verify the client owns the contract
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

        const contract = await prisma.projectContract.findUnique({
            where: { contractID },
            select: { clientID: true }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        if (contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        const milestone = await prisma.milestone.create({
            data: {
                contractID,
                title: title.trim(),
                description,
                dueDate: new Date(dueDate),
                milestoneAmount: new Prisma.Decimal(milestoneAmount),
                status: 'PENDING'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Milestone created successfully',
            data: milestone
        });

    } catch (error) {
        console.error('CreateMilestone error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMilestones = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { contractID } = req.query;

        let whereClause = {};

        if (contractID) {
            whereClause.contractID = contractID;
        }

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

            whereClause.contract = {
                ...whereClause.contract,
                clientID: client.clientID
            };
        }

        if (role === 'DEVELOPER') {
            whereClause.contract = {
                ...whereClause.contract,
                assignments: {
                    some: { developerID: userId }
                }
            };
        }

        const milestones = await prisma.milestone.findMany({
            where: whereClause,
            include: {
                contract: {
                    select: { contractID: true, title: true, status: true }
                },
                escrow: true
            },
            orderBy: { dueDate: 'asc' }
        });

        return res.status(200).json({
            success: true,
            data: milestones
        });

    } catch (error) {
        console.error('GetMilestones error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMilestoneById = async (req, res) => {
    try {
        const { id } = req.params;

        const milestone = await prisma.milestone.findUnique({
            where: { milestoneID: id },
            include: {
                contract: {
                    select: { contractID: true, title: true, status: true, clientID: true }
                },
                escrow: true
            }
        });

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found'
            });
        }

        return res.status(200).json({ success: true, data: milestone });

    } catch (error) {
        console.error('GetMilestoneById error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const ownership = await verifyMilestoneOwnership(id, userId);
        if (ownership.error) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.error
            });
        }

        if (ownership.milestone.status === 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a completed milestone'
            });
        }

        const allowedFields = ['title', 'description', 'dueDate', 'milestoneAmount'];
        let updateData = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'dueDate') {
                    updateData[key] = new Date(req.body[key]);
                } else if (key === 'milestoneAmount') {
                    updateData[key] = new Prisma.Decimal(req.body[key]);
                } else if (key === 'title') {
                    updateData[key] = req.body[key].trim();
                } else {
                    updateData[key] = req.body[key];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided to update'
            });
        }

        const updated = await prisma.milestone.update({
            where: { milestoneID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Milestone updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateMilestone error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateMilestoneStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { status } = req.body;

        if (!status || !VALID_MILESTONE_STATUS.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_MILESTONE_STATUS.join(', ')}`
            });
        }

        const ownership = await verifyMilestoneOwnership(id, userId);
        if (ownership.error) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.error
            });
        }

        const updateData = { status };

        if (status === 'COMPLETED') {
            updateData.completeDate = new Date();
        }

        const updated = await prisma.milestone.update({
            where: { milestoneID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Milestone status updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateMilestoneStatus error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const ownership = await verifyMilestoneOwnership(id, userId);
        if (ownership.error) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.error
            });
        }

        if (ownership.milestone.status === 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a completed milestone'
            });
        }

        await prisma.milestone.delete({
            where: { milestoneID: id }
        });

        return res.status(200).json({
            success: true,
            message: 'Milestone deleted successfully'
        });

    } catch (error) {
        console.error('DeleteMilestone error:', error);

        if (error.code === 'P2003') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete milestone with active escrow'
            });
        }

        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createMilestone,
    getMilestones,
    getMilestoneById,
    updateMilestone,
    updateMilestoneStatus,
    deleteMilestone
};
