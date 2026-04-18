const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');
const crypto = require('crypto');
const { createManyNotifications } = require('../services/notificationService');

// Helper: verify milestone ownership through contract → client chain
const verifyMilestoneOwnershipForEscrow = async (milestoneID, userId) => {
    const milestone = await prisma.milestone.findUnique({
        where: { milestoneID },
        include: {
            contract: { select: { clientID: true, contractID: true } },
            escrow: true
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

const notifyContractDevelopers = async (contractID, payload) => {
    if (!contractID) return;

    const assignments = await prisma.contractAssignment.findMany({
        where: { contractID },
        include: {
            developer: { select: { userID: true } }
        }
    });

    const notifications = assignments
        .map((assignment) => assignment.developer?.userID)
        .filter(Boolean)
        .map((userID) => ({
            userID,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            link: payload.link
        }));

    if (notifications.length > 0) {
        await createManyNotifications(notifications);
    }
};

const depositEscrow = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { milestoneID, depositAmount } = req.body;

        if (!milestoneID || !depositAmount) {
            return res.status(400).json({
                success: false,
                message: 'milestoneID and depositAmount are required'
            });
        }

        const ownership = await verifyMilestoneOwnershipForEscrow(milestoneID, userId);
        if (ownership.error) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.error
            });
        }

        // Check if escrow already exists for this milestone
        if (ownership.milestone.escrow) {
            return res.status(409).json({
                success: false,
                message: 'Escrow already exists for this milestone'
            });
        }

        const transactionReference = `TXN-${crypto.randomUUID()}`;

        const escrow = await prisma.paymentEscrow.create({
            data: {
                milestoneID,
                depositAmount: new Prisma.Decimal(depositAmount),
                paymentStatus: 'DEPOSITED',
                transactionReference
            }
        });

        try {
            await notifyContractDevelopers(ownership.milestone.contract?.contractID, {
                type: 'ESCROW_DEPOSITED',
                title: 'Escrow funded',
                body: `Escrow funded for milestone ${ownership.milestone.title || 'milestone'}.`,
                link: ownership.milestone.contract?.contractID
                    ? `/contracts/${ownership.milestone.contract.contractID}`
                    : null
            });
        } catch (error) {
            console.error('Escrow deposit notification error:', error);
        }

        return res.status(201).json({
            success: true,
            message: 'Escrow deposit created successfully',
            data: escrow
        });

    } catch (error) {
        console.error('DepositEscrow error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const { transactionReference, status, eventType } = req.body;

        if (!transactionReference || !status) {
            return res.status(400).json({
                success: false,
                message: 'transactionReference and status are required'
            });
        }

        const escrow = await prisma.paymentEscrow.findUnique({
            where: { transactionReference }
        });

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow transaction not found'
            });
        }

        const validStatuses = ['PENDING', 'DEPOSITED', 'RELEASED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const updateData = { paymentStatus: status };

        if (status === 'RELEASED') {
            updateData.releaseDate = new Date();
        }

        const updated = await prisma.paymentEscrow.update({
            where: { transactionReference },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: `Webhook processed: ${eventType || status}`,
            data: updated
        });

    } catch (error) {
        console.error('HandleWebhook error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const releaseEscrow = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { escrowID } = req.body;

        if (!escrowID) {
            return res.status(400).json({
                success: false,
                message: 'escrowID is required'
            });
        }

        const escrow = await prisma.paymentEscrow.findUnique({
            where: { escrowID },
            include: {
                milestone: {
                    include: {
                        contract: { select: { clientID: true } }
                    }
                }
            }
        });

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
            });
        }

        // Verify ownership
        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || escrow.milestone.contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        if (escrow.paymentStatus !== 'DEPOSITED') {
            return res.status(400).json({
                success: false,
                message: `Cannot release escrow with status: ${escrow.paymentStatus}. Must be DEPOSITED.`
            });
        }

        if (escrow.milestone.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot release escrow — milestone is not yet marked COMPLETED.'
            });
        }

        const updated = await prisma.paymentEscrow.update({
            where: { escrowID },
            data: {
                paymentStatus: 'RELEASED',
                releaseDate: new Date()
            }
        });

        try {
            await notifyContractDevelopers(escrow.milestone.contract?.contractID, {
                type: 'ESCROW_RELEASED',
                title: 'Escrow released',
                body: `Payment released for milestone ${escrow.milestone.title || 'milestone'}.`,
                link: escrow.milestone.contract?.contractID
                    ? `/contracts/${escrow.milestone.contract.contractID}`
                    : null
            });
        } catch (error) {
            console.error('Escrow release notification error:', error);
        }

        return res.status(200).json({
            success: true,
            message: 'Escrow released successfully',
            data: updated
        });

    } catch (error) {
        console.error('ReleaseEscrow error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const refundEscrow = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { escrowID } = req.body;

        if (!escrowID) {
            return res.status(400).json({
                success: false,
                message: 'escrowID is required'
            });
        }

        const escrow = await prisma.paymentEscrow.findUnique({
            where: { escrowID },
            include: {
                milestone: {
                    include: {
                        contract: { select: { clientID: true } }
                    }
                }
            }
        });

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
            });
        }

        // Verify ownership
        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || escrow.milestone.contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        if (escrow.paymentStatus === 'RELEASED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot refund an already released escrow'
            });
        }

        if (escrow.paymentStatus === 'REFUNDED') {
            return res.status(400).json({
                success: false,
                message: 'Escrow has already been refunded'
            });
        }

        const updated = await prisma.paymentEscrow.update({
            where: { escrowID },
            data: { paymentStatus: 'REFUNDED' }
        });

        return res.status(200).json({
            success: true,
            message: 'Escrow refunded successfully',
            data: updated
        });

    } catch (error) {
        console.error('RefundEscrow error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEscrowHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { contractID, milestoneID, paymentStatus } = req.query;

        let whereClause = {};

        // Filter by specific milestone
        if (milestoneID) {
            whereClause.milestoneID = milestoneID;
        }

        // Filter by payment status
        if (paymentStatus) {
            whereClause.paymentStatus = paymentStatus;
        }

        // Scope to user's contracts
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

            whereClause.milestone = {
                ...whereClause.milestone,
                contract: {
                    clientID: client.clientID,
                    ...(contractID ? { contractID } : {})
                }
            };
        }

        if (role === 'DEVELOPER') {
            whereClause.milestone = {
                ...whereClause.milestone,
                contract: {
                    assignments: { some: { developerID: userId } },
                    ...(contractID ? { contractID } : {})
                }
            };
        }

        const escrows = await prisma.paymentEscrow.findMany({
            where: whereClause,
            include: {
                milestone: {
                    select: {
                        milestoneID: true,
                        title: true,
                        status: true,
                        milestoneAmount: true,
                        contract: {
                            select: { contractID: true, title: true }
                        }
                    }
                }
            },
            orderBy: { depositDate: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: escrows
        });

    } catch (error) {
        console.error('GetEscrowHistory error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    depositEscrow,
    handleWebhook,
    releaseEscrow,
    refundEscrow,
    getEscrowHistory
};
