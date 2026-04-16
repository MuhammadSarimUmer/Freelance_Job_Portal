const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

router.post('/image', authMiddleware.verifyToken, uploadMiddleware.uploadSingle, uploadController.uploadFile);
router.post('/document', authMiddleware.verifyToken, uploadMiddleware.uploadSingle, uploadController.uploadCv);

module.exports = router;