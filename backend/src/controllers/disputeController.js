const prisma = require('../config/prisma');

const resolveClientProfile = async (userId) => prisma.client.findUnique({
    where: { userID: userId },
    select: { clientID: true }
});

const resolveDeveloperProfile = async (userId) => prisma.developer.findUnique({
    where: { userID: userId },
    select: { developerID: true }
});

const assertContractAccess = async (contractID, userId, role) => {
    const contract = await prisma.projectContract.findUnique({
        where: { contractID },
        include: {
            milestones: { include: { escrow: true } },
            assignments: { select: { developerID: true } },
            client: { select: { clientID: true } }
        }
    });

    if (!contract) {
        const error = new Error('Contract not found');
        error.statusCode = 404;
        throw error;
    }

    if (role === 'CLIENT') {
        const client = await resolveClientProfile(userId);
        if (!client || client.clientID !== contract.clientID) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
    } else if (role === 'DEVELOPER') {
        const developer = await resolveDeveloperProfile(userId);
        if (!developer) {
            const error = new Error('Developer profile not found');
            error.statusCode = 404;
            throw error;
        }

        const isAssigned = contract.assignments.some(
            (assignment) => assignment.developerID === developer.developerID
        );

        if (!isAssigned) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
    } else {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    return contract;
};

const raiseDispute = async (req, res) => {
    try {
        const { contractID, reason } = req.body;

        if (!contractID || !reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'contractID and reason are required'
            });
        }

        const contract = await assertContractAccess(contractID, req.user.userId, req.user.role);

        if (contract.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                message: 'Disputes can only be raised while a contract is in progress'
            });
        }

        const hasDepositedEscrow = contract.milestones.some(
            (milestone) => milestone.escrow?.paymentStatus === 'DEPOSITED'
        );

        if (!hasDepositedEscrow) {
            return res.status(400).json({
                success: false,
                message: 'An escrow deposit is required before raising a dispute'
            });
        }

        const existing = await prisma.dispute.findFirst({
            where: {
                contractID,
                status: { in: ['OPEN', 'UNDER_REVIEW'] }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An open dispute already exists for this contract'
            });
        }

        const dispute = await prisma.dispute.create({
            data: {
                contractID,
                raisedByID: req.user.userId,
                reason: reason.trim(),
                status: 'OPEN'
            },
            include: {
                raisedBy: { select: { userID: true, fullName: true, profileImageUrl: true } }
            }
        });

        return res.status(201).json({ success: true, data: dispute });
    } catch (error) {
        console.error('RaiseDispute error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const getDisputesForContract = async (req, res) => {
    try {
        const { contractID } = req.params;

        await assertContractAccess(contractID, req.user.userId, req.user.role);

        const disputes = await prisma.dispute.findMany({
            where: { contractID },
            orderBy: { createdAt: 'desc' },
            include: {
                raisedBy: { select: { userID: true, fullName: true, profileImageUrl: true } }
            }
        });

        return res.status(200).json({ success: true, data: disputes });
    } catch (error) {
        console.error('GetDisputesForContract error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { status, resolution } = req.body;

        const allowedStatuses = ['UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${allowedStatuses.join(', ')}`
            });
        }

        const dispute = await prisma.dispute.findUnique({
            where: { disputeID: disputeId },
            include: {
                contract: {
                    include: {
                        client: { select: { clientID: true } },
                        assignments: { select: { developerID: true } }
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        await assertContractAccess(dispute.contractID, req.user.userId, req.user.role);

        const updateData = {
            status,
            resolution: resolution ? resolution.trim() : null
        };

        if (['RESOLVED', 'CLOSED'].includes(status)) {
            updateData.resolvedAt = new Date();
        }

        const updated = await prisma.dispute.update({
            where: { disputeID: disputeId },
            data: updateData,
            include: {
                raisedBy: { select: { userID: true, fullName: true, profileImageUrl: true } }
            }
        });

        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('ResolveDispute error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    raiseDispute,
    getDisputesForContract,
    resolveDispute
};
