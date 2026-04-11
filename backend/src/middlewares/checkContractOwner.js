const prisma = require('../config/prisma');

const checkContractOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

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

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            select: { clientID: true }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        if (contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        next();

    } catch (error) {
        console.error('Ownership middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = checkContractOwner;