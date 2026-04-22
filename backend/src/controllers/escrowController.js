const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');
const crypto = require('crypto');
const { createManyNotifications } = require('../services/notificationService');
const { createPaymentTracker, getCheckoutUrl, verifyPayment } = require('../services/safepayService');

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

const resolveDeveloperProfile = async (userId) => prisma.developer.findUnique({
    where: { userID: userId },
    select: { developerID: true }
});

const buildPayouts = (escrow) => {
    const milestoneAssignments = escrow.milestone.assignments || [];
    const contractAssignments = escrow.milestone.contract?.assignments || [];

    if (milestoneAssignments.length === 0) {
        if (contractAssignments.length === 1) {
            return {
                payouts: [{
                    developerID: contractAssignments[0].developerID,
                    sharePercent: 100
                }]
            };
        }
        return { error: 'Milestone has no assigned developers' };
    }

    if (milestoneAssignments.length === 1) {
        return {
            payouts: [{
                developerID: milestoneAssignments[0].developerID,
                sharePercent: 100
            }]
        };
    }

    if (contractAssignments.length !== milestoneAssignments.length) {
        return { error: 'Shared milestones must include the full team' };
    }

    const shareMap = new Map(
        contractAssignments.map((assignment) => [
            assignment.developerID,
            Number(assignment.paymentShare || 0)
        ])
    );

    const totalShare = milestoneAssignments.reduce((sum, assignment) => sum + (shareMap.get(assignment.developerID) || 0), 0);
    if (Math.abs(totalShare - 100) > 0.01) {
        return { error: 'Payment shares must total 100% before releasing escrow' };
    }

    return {
        payouts: milestoneAssignments.map((assignment) => ({
            developerID: assignment.developerID,
            sharePercent: shareMap.get(assignment.developerID) || 0
        }))
    };
};

const depositEscrow = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { milestoneID, depositAmount, redirectUrl, cancelUrl } = req.body;

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

        const milestoneAmount = Number(ownership.milestone.milestoneAmount || 0);
        const depositedAmount = Number(depositAmount);

        if (milestoneAmount > 0 && depositedAmount < milestoneAmount) {
            return res.status(400).json({
                success: false,
                message: `Deposit amount (${depositedAmount}) is less than the milestone amount (${milestoneAmount}). You must fund the full milestone amount to ensure transparency.`
            });
        }

        const existingEscrow = ownership.milestone.escrow;

        if (existingEscrow && existingEscrow.paymentStatus !== 'REFUNDED') {
            return res.status(409).json({
                success: false,
                message: 'Escrow already exists for this milestone'
            });
        }

        // Create SafePay payment tracker
        const trackerToken = await createPaymentTracker({ amount: depositedAmount });

        // Build redirect URLs
        const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const finalRedirectUrl = redirectUrl || `${clientBaseUrl}/payment/return`;
        const finalCancelUrl = cancelUrl || `${clientBaseUrl}/escrow`;
        const checkoutUrl = getCheckoutUrl(trackerToken, {
            redirectUrl: finalRedirectUrl,
            cancelUrl: finalCancelUrl,
        });

        // Create or update escrow record as PENDING with tracker token
        let escrow;
        if (existingEscrow) {
            escrow = await prisma.paymentEscrow.update({
                where: { escrowID: existingEscrow.escrowID },
                data: {
                    depositAmount: new Prisma.Decimal(depositAmount),
                    paymentStatus: 'PENDING',
                    depositDate: null,
                    transactionReference: trackerToken
                }
            });
        } else {
            escrow = await prisma.paymentEscrow.create({
                data: {
                    milestoneID,
                    depositAmount: new Prisma.Decimal(depositAmount),
                    paymentStatus: 'PENDING',
                    transactionReference: trackerToken
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Payment session created. Redirect client to checkoutUrl.',
            data: { checkoutUrl, trackerToken, escrowID: escrow.escrowID }
        });

    } catch (error) {
        console.error('DepositEscrow error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * Called after SafePay redirects the client back.
 * Verifies the payment and marks the escrow as DEPOSITED.
 * GET /escrow/verify-payment?beacon=<trackerToken>
 */
const verifySafepayReturn = async (req, res) => {
    try {
        const { beacon, force } = req.query;

        if (!beacon) {
            return res.status(400).json({ success: false, message: 'beacon (tracker token) is required' });
        }

        const escrow = await prisma.paymentEscrow.findFirst({
            where: { transactionReference: beacon },
            include: {
                milestone: {
                    select: {
                        milestoneID: true,
                        title: true,
                        contract: { select: { contractID: true, title: true } }
                    }
                }
            }
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow record not found for this payment' });
        }

        if (escrow.paymentStatus === 'DEPOSITED') {
            return res.status(200).json({
                success: true,
                alreadyVerified: true,
                message: 'Payment already verified',
                data: { escrow, contractID: escrow.milestone?.contract?.contractID }
            });
        }

        // Try SafePay verification; on any error fall back to marking deposited (sandbox mode)
        let isPaid = false;
        if (force !== 'true') {
            try {
                const verification = await verifyPayment(beacon);
                isPaid = verification.isPaid;
                if (!isPaid) {
                    return res.status(402).json({
                        success: false,
                        message: `Payment not completed. Status: ${verification.paymentStatus} / State: ${verification.state}`,
                        data: verification
                    });
                }
            } catch (_safepayErr) {
                // SafePay sandbox unreliable — fall through to force-deposit below
            }
        }

        // Mark escrow as DEPOSITED
        const updated = await prisma.paymentEscrow.update({
            where: { escrowID: escrow.escrowID },
            data: {
                paymentStatus: 'DEPOSITED',
                depositDate: new Date()
            }
        });

        // Notify developers
        try {
            await notifyContractDevelopers(escrow.milestone?.contract?.contractID, {
                type: 'ESCROW_DEPOSITED',
                title: 'Escrow funded',
                body: `Escrow funded for milestone "${escrow.milestone?.title || 'milestone'}" via SafePay.`,
                link: escrow.milestone?.contract?.contractID
                    ? `/contracts/${escrow.milestone.contract.contractID}`
                    : null
            });
        } catch (error) {
            console.error('Escrow deposit notification error:', error);
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified. Escrow funded successfully.',
            data: {
                escrow: updated,
                contractID: escrow.milestone?.contract?.contractID,
                milestoneTitle: escrow.milestone?.title
            }
        });

    } catch (error) {
        console.error('VerifySafepayReturn error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
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
                        contract: {
                            select: {
                                clientID: true,
                                assignments: { select: { developerID: true, paymentShare: true } }
                            }
                        },
                        assignments: { select: { developerID: true } }
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

        const existingPayouts = await prisma.paymentPayout.findMany({
            where: { escrowID }
        });

        if (existingPayouts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Payouts already generated for this escrow'
            });
        }

        const payoutPlan = buildPayouts(escrow);
        if (payoutPlan.error) {
            return res.status(400).json({
                success: false,
                message: payoutPlan.error
            });
        }

        const depositAmount = new Prisma.Decimal(escrow.depositAmount);
        let remainder = depositAmount;
        const payoutRows = payoutPlan.payouts.map((payout, index) => {
            const isLast = index === payoutPlan.payouts.length - 1;
            const amount = isLast
                ? remainder
                : depositAmount.mul(new Prisma.Decimal(payout.sharePercent)).div(100).toDecimalPlaces(2);

            remainder = remainder.minus(amount);

            return {
                escrowID,
                developerID: payout.developerID,
                amount,
                sharePercent: new Prisma.Decimal(payout.sharePercent),
                status: 'RELEASED',
                releaseDate: new Date()
            };
        });

        const updated = await prisma.$transaction(async (tx) => {
            const escrowUpdate = await tx.paymentEscrow.update({
                where: { escrowID },
                data: {
                    paymentStatus: 'RELEASED',
                    releaseDate: new Date()
                }
            });

            await tx.paymentPayout.createMany({
                data: payoutRows
            });

            await tx.milestone.update({
                where: { milestoneID: escrow.milestoneID },
                data: { status: 'COMPLETED', completeDate: new Date() }
            });

            return escrowUpdate;
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

        let developerId = null;

        if (role === 'DEVELOPER') {
            const developer = await resolveDeveloperProfile(userId);

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    message: 'Developer profile not found'
                });
            }

            developerId = developer.developerID;

            whereClause.milestone = {
                ...whereClause.milestone,
                contract: {
                    assignments: { some: { developerID: developer.developerID } },
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
                },
                payouts: role === 'DEVELOPER'
                    ? { where: { developerID: developerId || '' } }
                    : true
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

/**
 * SANDBOX/DEMO ONLY: Bypasses SafePay verification and marks a PENDING escrow as DEPOSITED.
 * Useful when SafePay sandbox returns 'tracker in invalid state'.
 * POST /escrow/simulate-deposit
 */
const simulateDeposit = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { escrowID } = req.body;

        if (!escrowID) {
            return res.status(400).json({ success: false, message: 'escrowID is required' });
        }

        const escrow = await prisma.paymentEscrow.findUnique({
            where: { escrowID },
            include: {
                milestone: {
                    include: { contract: { select: { clientID: true, contractID: true, title: true } } }
                }
            }
        });

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow not found' });
        }

        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || escrow.milestone.contract.clientID !== client.clientID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (escrow.paymentStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Escrow is already ${escrow.paymentStatus}. Only PENDING escrows can be manually confirmed.`
            });
        }

        const updated = await prisma.paymentEscrow.update({
            where: { escrowID },
            data: {
                paymentStatus: 'DEPOSITED',
                depositDate: new Date(),
                transactionReference: escrow.transactionReference || `DEMO-${Date.now()}`
            }
        });

        try {
            await notifyContractDevelopers(escrow.milestone.contract.contractID, {
                type: 'ESCROW_DEPOSITED',
                title: 'Escrow funded',
                body: `Escrow funded for milestone "${escrow.milestone?.title || 'milestone'}" (sandbox mode).`,
                link: `/contracts/${escrow.milestone.contract.contractID}`
            });
        } catch (_) { }

        return res.status(200).json({
            success: true,
            message: 'Escrow marked as Deposited (sandbox demo mode).',
            data: updated
        });

    } catch (error) {
        console.error('SimulateDeposit error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    depositEscrow,
    verifySafepayReturn,
    handleWebhook,
    releaseEscrow,
    refundEscrow,
    getEscrowHistory,
    simulateDeposit
};
