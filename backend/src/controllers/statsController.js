const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        const stats = {};

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

            const clientID = client.clientID;

            // Total contracts + per-status breakdown
            const contractsByStatus = await prisma.projectContract.groupBy({
                by: ['status'],
                where: { clientID },
                _count: { status: true }
            });

            const totalContracts = contractsByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const contractStatusBreakdown = {};
            contractsByStatus.forEach(g => {
                contractStatusBreakdown[g.status] = g._count.status;
            });

            // Total amount across all contracts
            const totalAmount = await prisma.projectContract.aggregate({
                where: { clientID },
                _sum: { totalAmount: true }
            });

            // Get all contract IDs for this client
            const contractIDs = await prisma.projectContract.findMany({
                where: { clientID },
                select: { contractID: true }
            });
            const contractIdList = contractIDs.map(c => c.contractID);

            // Milestones per-status breakdown
            const milestonesByStatus = await prisma.milestone.groupBy({
                by: ['status'],
                where: { contractID: { in: contractIdList } },
                _count: { status: true }
            });

            const totalMilestones = milestonesByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const milestoneStatusBreakdown = {};
            milestonesByStatus.forEach(g => {
                milestoneStatusBreakdown[g.status] = g._count.status;
            });

            // Bug reports per-status breakdown
            const bugsByStatus = await prisma.bugReport.groupBy({
                by: ['status'],
                where: { contractID: { in: contractIdList } },
                _count: { status: true }
            });

            const totalBugs = bugsByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const bugStatusBreakdown = {};
            bugsByStatus.forEach(g => {
                bugStatusBreakdown[g.status] = g._count.status;
            });

            // Escrow financials
            const escrowStats = await prisma.paymentEscrow.aggregate({
                where: {
                    milestone: { contractID: { in: contractIdList } }
                },
                _sum: { depositAmount: true },
                _count: { escrowID: true }
            });

            const releasedEscrow = await prisma.paymentEscrow.aggregate({
                where: {
                    milestone: { contractID: { in: contractIdList } },
                    paymentStatus: 'RELEASED'
                },
                _sum: { depositAmount: true }
            });

            stats.contracts = {
                total: totalContracts,
                byStatus: contractStatusBreakdown
            };

            stats.totalAmount = totalAmount._sum.totalAmount || 0;

            stats.milestones = {
                total: totalMilestones,
                byStatus: milestoneStatusBreakdown
            };

            stats.bugs = {
                total: totalBugs,
                byStatus: bugStatusBreakdown
            };

            stats.escrow = {
                totalDeposited: escrowStats._sum.depositAmount || 0,
                totalReleased: releasedEscrow._sum.depositAmount || 0,
                totalTransactions: escrowStats._count.escrowID
            };
        }

        if (role === 'DEVELOPER') {
            const developer = await prisma.developer.findUnique({
                where: { userID: userId },
                select: { developerID: true }
            });

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    message: 'Developer profile not found'
                });
            }

            const developerID = developer.developerID;

            // Get assigned contract IDs
            const assignments = await prisma.contractAssignment.findMany({
                where: { developerID },
                select: { contractID: true }
            });
            const contractIdList = assignments.map(a => a.contractID);

            // Assigned contracts per-status breakdown
            const contractsByStatus = await prisma.projectContract.groupBy({
                by: ['status'],
                where: { contractID: { in: contractIdList } },
                _count: { status: true }
            });

            const totalContracts = contractsByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const contractStatusBreakdown = {};
            contractsByStatus.forEach(g => {
                contractStatusBreakdown[g.status] = g._count.status;
            });

            // Milestones on assigned contracts
            const milestonesByStatus = await prisma.milestone.groupBy({
                by: ['status'],
                where: { contractID: { in: contractIdList } },
                _count: { status: true }
            });

            const totalMilestones = milestonesByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const milestoneStatusBreakdown = {};
            milestonesByStatus.forEach(g => {
                milestoneStatusBreakdown[g.status] = g._count.status;
            });

            // Bugs on assigned contracts
            const bugsByStatus = await prisma.bugReport.groupBy({
                by: ['status'],
                where: { contractID: { in: contractIdList } },
                _count: { status: true }
            });

            const totalBugs = bugsByStatus.reduce((sum, g) => sum + g._count.status, 0);
            const bugStatusBreakdown = {};
            bugsByStatus.forEach(g => {
                bugStatusBreakdown[g.status] = g._count.status;
            });

            stats.contracts = {
                total: totalContracts,
                byStatus: contractStatusBreakdown
            };

            stats.milestones = {
                total: totalMilestones,
                byStatus: milestoneStatusBreakdown
            };

            stats.bugs = {
                total: totalBugs,
                byStatus: bugStatusBreakdown
            };
        }

        // Common stats for both roles
        const totalApplications = await prisma.application.count();
        const totalTechnologies = await prisma.technologyStack.count();

        stats.applications = totalApplications;
        stats.technologies = totalTechnologies;

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('GetDashboardStats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getDashboardStats
};
