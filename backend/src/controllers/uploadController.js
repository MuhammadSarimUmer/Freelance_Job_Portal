const uploadService = require('../services/uploadService');
const prisma = require('../config/prisma');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = await uploadService.uploadToCloud(req.file);

        if (req.user.role === 'DEVELOPER') {
            await prisma.developer.update({
                where: { userID: req.user.userId },
                data: { portfolioURL: fileUrl }
            });
        }

        res.status(200).json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
}

const uploadCv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = await uploadService.uploadToCloud(req.file);

        if (req.user.role === 'DEVELOPER') {
            await prisma.developer.update({
                where: { userID: req.user.userId },
                data: { cvUrl: fileUrl }
            });
        }

        res.status(200).json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Upload CV error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
}
module.exports = {
    uploadFile,
    uploadCv
};