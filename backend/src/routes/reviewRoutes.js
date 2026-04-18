const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), reviewController.createReview);
router.get('/user/:userID', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), reviewController.getReviewsForUser);
router.get('/me', verifyToken, requireRoles(['CLIENT', 'DEVELOPER']), reviewController.getMyReviews);

module.exports = router;
