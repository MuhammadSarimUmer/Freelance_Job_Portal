const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

const VALID_PROFICIENCY_LEVEL = [
    'BEGINNER',
    'INTERMEDIATE',
    'EXPERT'
];

const ALLOWED_STATUS_TRANSITIONS = {
    DRAFT: ['SIGNED', 'CANCELLED'],
    SIGNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
};

const contractDetailInclude = {
    client: {
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true,
                    profileImageUrl: true
                }
            }
        }
    },
    application: true,
    assignments: {
        include: {
            developer: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            profileImageUrl: true
                        }
                    }
                }
            }
        }
    },
    proposals: {
        include: {
            developer: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            profileImageUrl: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    },
    technologies: {
        include: {
            tech: true
        }
    },
    milestones: true,
    bugReports: true
};

const resolveClientProfile = async (userId) => prisma.client.findUnique({
    where: { userID: userId },
    select: { clientID: true }
});

const resolveDeveloperProfile = async (userId) => prisma.developer.findUnique({
    where: { userID: userId },
    select: { developerID: true }
});

const canTransitionStatus = (currentStatus, nextStatus) =>
    ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus);

const createContract = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            appID,
            title,
            description,
            startDate,
            endDate,
            totalAmount
        } = req.body;

        const amount = new Prisma.Decimal(totalAmount);

        const client = await prisma.client.findUnique({
            where: { userID: userId }
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client profile not found'
            });
        }

        const app = await prisma.application.findUnique({
            where: { appID }
        });

        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const contract = await prisma.projectContract.create({
            data: {
                clientID: client.clientID,
                appID,
                title: title.trim(),
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                totalAmount: amount,
                status: 'DRAFT'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Contract created successfully',
            data: contract
        });

    } catch (error) {
        console.error('CreateContract error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getContracts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let whereClause = {};

        if (role === 'CLIENT') {
            const client = await resolveClientProfile(userId);

            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client profile not found'
                });
            }

            whereClause.clientID = client.clientID;
        }

        if (role === 'DEVELOPER') {
            const developer = await resolveDeveloperProfile(userId);

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    message: 'Developer profile not found'
                });
            }

            whereClause.assignments = {
                some: { developerID: developer.developerID }
            };
        }

        const contracts = await prisma.projectContract.findMany({
            where: whereClause,
            include: contractDetailInclude
        });

        return res.status(200).json({
            success: true,
            data: contracts
        });

    } catch (error) {
        console.error('GetContracts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getOpenContracts = async (req, res) => {
    try {
        const contracts = await prisma.projectContract.findMany({
            where: {
                status: 'DRAFT'
            },
            include: contractDetailInclude,
            orderBy: {
                startDate: 'asc'
            }
        });

        return res.status(200).json({
            success: true,
            data: contracts
        });

    } catch (error) {
        console.error('GetOpenContracts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            include: contractDetailInclude
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        if (role === 'CLIENT') {
            const client = await resolveClientProfile(userId);
            if (!client || contract.clientID !== client.clientID) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
        }

        if (role === 'DEVELOPER') {
            const developer = await resolveDeveloperProfile(userId);
            if (!developer) {
                return res.status(404).json({ success: false, message: 'Developer profile not found' });
            }

            const assignedToContract = contract.assignments.some(
                (assignment) => assignment.developerID === developer.developerID
            );
            const hasProposal = contract.proposals.some(
                (proposal) => proposal.developerID === developer.developerID
            );

            if (!assignedToContract && !hasProposal && contract.status !== 'DRAFT') {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }
        }

        return res.status(200).json({ success: true, data: contract });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateContract = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        if (existing.status !== 'DRAFT') {
            return res.status(400).json({
                success: false,
                message: 'Only DRAFT contracts can be updated'
            });
        }

        const allowedFields = [
            'title',
            'description',
            'startDate',
            'endDate',
            'totalAmount'
        ];

        let updateData = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'startDate' || key === 'endDate') {
                    updateData[key] = new Date(req.body[key]);
                } else if (key === 'totalAmount') {
                    updateData[key] = new Prisma.Decimal(req.body[key]);
                } else if (key === 'title') {
                    updateData[key] = req.body[key].trim();
                } else {
                    updateData[key] = req.body[key];
                }
            }
        }

        const updated = await prisma.projectContract.update({
            where: { contractID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Contract updated successfully',
            data: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateContractStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        if (!canTransitionStatus(contract.status, status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${contract.status} to ${status}`
            });
        }

        const updateData = { status };
        if (status === 'SIGNED' && !contract.signedDate) {
            updateData.signedDate = new Date();
        }

        const updated = await prisma.projectContract.update({
            where: { contractID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addContractTech = async (req, res) => {
    try {
        const { id } = req.params;
        const { techID, requiredLevel, purpose } = req.body;

        if (!techID || !requiredLevel) {
            return res.status(400).json({
                success: false,
                message: 'techID and requiredLevel are required'
            });
        }

        if (!VALID_PROFICIENCY_LEVEL.includes(requiredLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid proficiency level'
            });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        const existing = await prisma.contractTechnology.findUnique({
            where: {
                contractID_techID: {
                    contractID: id,
                    techID
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Technology already added to this contract'
            });
        }

        const tech = await prisma.contractTechnology.create({
            data: {
                contractID: id,
                techID,
                requiredLevel,
                purpose
            }
        });

        return res.status(201).json({ success: true, data: tech });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const removeContractTech = async (req, res) => {
    try {
        const { id, techId } = req.params;

        const existing = await prisma.contractTechnology.findUnique({
            where: {
                contractID_techID: {
                    contractID: id,
                    techID: techId
                }
            }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Technology not found on this contract'
            });
        }

        await prisma.contractTechnology.delete({
            where: {
                contractID_techID: {
                    contractID: id,
                    techID: techId
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Technology removed from contract successfully'
        });

    } catch (error) {
        console.error('RemoveContractTech error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const assignDeveloper = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            developerID,
            role,
            contributionPercentage,
            paymentShare
        } = req.body;

        if (!developerID || !role) {
            return res.status(400).json({
                success: false,
                message: 'developerID and role are required'
            });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        const developer = await prisma.developer.findUnique({
            where: { developerID }
        });

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer not found'
            });
        }

        const cp = Number(contributionPercentage || 0);
        const ps = Number(paymentShare || 0);

        if (isNaN(cp) || isNaN(ps)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid numeric values'
            });
        }

        const existing = await prisma.contractAssignment.findUnique({
            where: {
                developerID_contractID: {
                    developerID,
                    contractID: id
                }
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Developer already assigned to this contract'
            });
        }

        const assignment = await prisma.contractAssignment.create({
            data: {
                contractID: id,
                developerID,
                role,
                contributionPercentage: new Prisma.Decimal(cp),
                paymentShare: new Prisma.Decimal(ps)
            }
        });

        await prisma.contractProposal.upsert({
            where: {
                contractID_developerID: {
                    contractID: id,
                    developerID
                }
            },
            update: {
                source: 'CLIENT_INVITE',
                status: 'ACCEPTED',
                role,
                decidedAt: new Date(),
                declineReason: null
            },
            create: {
                contractID: id,
                developerID,
                source: 'CLIENT_INVITE',
                status: 'ACCEPTED',
                role,
                decidedAt: new Date()
            }
        });

        await prisma.projectContract.update({
            where: { contractID: id },
            data: {
                status: contract.status === 'DRAFT' ? 'SIGNED' : contract.status,
                signedDate: contract.signedDate || new Date()
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Developer assigned successfully',
            data: assignment
        });

    } catch (error) {
        console.error('AssignDeveloper error:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const assignment = await prisma.contractAssignment.findUnique({
            where: { assignmentID: id },
            include: {
                contract: { select: { clientID: true } }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Verify the requesting client owns the contract
        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || assignment.contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        const allowedFields = ['role', 'contributionPercentage', 'paymentShare'];
        let updateData = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'contributionPercentage' || key === 'paymentShare') {
                    const val = Number(req.body[key]);
                    if (isNaN(val)) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid numeric value for ${key}`
                        });
                    }
                    updateData[key] = new Prisma.Decimal(val);
                } else {
                    updateData[key] = req.body[key];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided to update'
            });
        }

        const updated = await prisma.contractAssignment.update({
            where: { assignmentID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateTeamMember error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const removeTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const assignment = await prisma.contractAssignment.findUnique({
            where: { assignmentID: id },
            include: {
                contract: { select: { clientID: true } }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Verify the requesting client owns the contract
        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || assignment.contract.clientID !== client.clientID) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - You do not own this contract'
            });
        }

        await prisma.contractAssignment.delete({
            where: { assignmentID: id }
        });

        return res.status(200).json({
            success: true,
            message: 'Team member removed successfully'
        });

    } catch (error) {
        console.error('RemoveTeamMember error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteContract = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        await prisma.projectContract.delete({
            where: { contractID: id }
        });

        return res.status(200).json({
            success: true,
            message: 'Contract deleted successfully'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'P2003') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete contract with active relations'
            });
        }

        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createContract,
    getContracts,
    getOpenContracts,
    getContractById,
    updateContract,
    updateContractStatus,
    addContractTech,
    removeContractTech,
    assignDeveloper,
    updateTeamMember,
    removeTeamMember,
    deleteContract
};