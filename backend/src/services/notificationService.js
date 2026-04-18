const prisma = require('../config/prisma');

const createNotification = async ({ userID, type, title, body, link }) => {
    if (!userID || !type || !title) {
        return null;
    }

    return prisma.notification.create({
        data: {
            userID,
            type,
            title,
            body: body || '',
            link: link || null
        }
    });
};

const createManyNotifications = async (notifications) => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
        return { count: 0 };
    }

    const data = notifications
        .filter((notification) => notification?.userID && notification?.type && notification?.title)
        .map((notification) => ({
            userID: notification.userID,
            type: notification.type,
            title: notification.title,
            body: notification.body || '',
            link: notification.link || null
        }));

    if (data.length === 0) {
        return { count: 0 };
    }

    return prisma.notification.createMany({ data });
};

module.exports = {
    createNotification,
    createManyNotifications
};
