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
        select: {
            contractID: true,
            clientID: true,
            assignments: { select: { developerID: true } }
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

const sendMessage = async (req, res) => {
    try {
        const { contractID, content } = req.body;

        if (!contractID || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'contractID and content are required'
            });
        }

        await assertContractAccess(contractID, req.user.userId, req.user.role);

        const message = await prisma.message.create({
            data: {
                contractID,
                senderID: req.user.userId,
                content: content.trim()
            },
            include: {
                sender: {
                    select: {
                        userID: true,
                        fullName: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        return res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error('SendMessage error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { contractID } = req.params;
        const { since } = req.query;

        await assertContractAccess(contractID, req.user.userId, req.user.role);

        const whereClause = { contractID };

        if (since) {
            const parsedSince = new Date(since);
            if (Number.isNaN(parsedSince.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid since timestamp'
                });
            }
            whereClause.createdAt = { gt: parsedSince };
        }

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: {
                        userID: true,
                        fullName: true,
                        profileImageUrl: true
                    }
                }
            }
        });

        return res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error('GetMessages error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { contractID } = req.params;

        await assertContractAccess(contractID, req.user.userId, req.user.role);

        const result = await prisma.message.updateMany({
            where: {
                contractID,
                senderID: { not: req.user.userId },
                isRead: false
            },
            data: { isRead: true }
        });

        return res.status(200).json({ success: true, data: { updated: result.count } });
    } catch (error) {
        console.error('MarkAsRead error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    markAsRead
};
