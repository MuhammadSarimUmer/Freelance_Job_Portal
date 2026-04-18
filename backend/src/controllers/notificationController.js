const prisma = require('../config/prisma');

const getMyNotifications = async (req, res) => {
    try {
        const userID = req.user.userId;

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userID },
                orderBy: { createdAt: 'desc' },
                take: 20
            }),
            prisma.notification.count({
                where: { userID, isRead: false }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    } catch (error) {
        console.error('GetMyNotifications error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const markAllRead = async (req, res) => {
    try {
        const userID = req.user.userId;

        const result = await prisma.notification.updateMany({
            where: { userID, isRead: false },
            data: { isRead: true }
        });

        return res.status(200).json({
            success: true,
            data: { updated: result.count }
        });
    } catch (error) {
        console.error('MarkAllRead error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getMyNotifications,
    markAllRead
};
