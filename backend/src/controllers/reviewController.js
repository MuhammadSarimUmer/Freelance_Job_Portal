const prisma = require('../config/prisma');

const getContractParticipants = async (contractID) => {
    const contract = await prisma.projectContract.findUnique({
        where: { contractID },
        include: {
            client: { select: { clientID: true, userID: true } },
            assignments: { select: { developerID: true } }
        }
    });

    if (!contract) {
        const error = new Error('Contract not found');
        error.statusCode = 404;
        throw error;
    }

    const developerIds = contract.assignments.map((assignment) => assignment.developerID);
    const developers = developerIds.length
        ? await prisma.developer.findMany({
            where: { developerID: { in: developerIds } },
            select: { developerID: true, userID: true }
        })
        : [];

    return {
        contract,
        clientUserId: contract.client?.userID,
        developerUserIds: developers.map((developer) => developer.userID)
    };
};

const createReview = async (req, res) => {
    try {
        const { contractID, revieweeID, rating, comment } = req.body;
        const reviewerID = req.user.userId;

        if (!contractID || !revieweeID || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: 'contractID, revieweeID, and rating are required'
            });
        }

        const parsedRating = parseInt(rating, 10);
        if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const existing = await prisma.review.findUnique({
            where: { contractID }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'A review already exists for this contract'
            });
        }

        const { contract, clientUserId, developerUserIds } = await getContractParticipants(contractID);

        if (contract.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Reviews can only be submitted after contract completion'
            });
        }

        if (reviewerID === revieweeID) {
            return res.status(400).json({
                success: false,
                message: 'Reviewer and reviewee cannot be the same'
            });
        }

        if (req.user.role === 'CLIENT') {
            if (reviewerID !== clientUserId) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            if (!developerUserIds.includes(revieweeID)) {
                return res.status(400).json({
                    success: false,
                    message: 'Reviewee must be an assigned developer'
                });
            }
        } else if (req.user.role === 'DEVELOPER') {
            if (!developerUserIds.includes(reviewerID)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            if (revieweeID !== clientUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Reviewee must be the contract client'
                });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const review = await prisma.review.create({
            data: {
                contractID,
                reviewerID,
                revieweeID,
                rating: parsedRating,
                comment: comment ? comment.trim() : null
            },
            include: {
                reviewer: { select: { userID: true, fullName: true, profileImageUrl: true } },
                reviewee: { select: { userID: true, fullName: true, profileImageUrl: true } },
                contract: { select: { contractID: true, title: true } }
            }
        });

        return res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error('CreateReview error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const getReviewsForUser = async (req, res) => {
    try {
        const { userID } = req.params;

        const reviews = await prisma.review.findMany({
            where: { revieweeID: userID },
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: { select: { userID: true, fullName: true, profileImageUrl: true } },
                contract: { select: { contractID: true, title: true } }
            }
        });

        const aggregate = await prisma.review.aggregate({
            where: { revieweeID: userID },
            _avg: { rating: true },
            _count: { reviewID: true }
        });

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                averageRating: aggregate._avg.rating || 0,
                count: aggregate._count.reviewID || 0
            }
        });
    } catch (error) {
        console.error('GetReviewsForUser error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const reviewerID = req.user.userId;

        const reviews = await prisma.review.findMany({
            where: { reviewerID },
            orderBy: { createdAt: 'desc' },
            include: {
                reviewee: { select: { userID: true, fullName: true, profileImageUrl: true } },
                contract: { select: { contractID: true, title: true } }
            }
        });

        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error('GetMyReviews error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createReview,
    getReviewsForUser,
    getMyReviews
};
