const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const { sendInvitationEmail, sendProposalSubmittedEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

const contractInclude = {
    contract: {
        include: {
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
            technologies: {
                include: {
                    tech: true
                }
            }
        }
    },
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
};

const resolveClientProfile = async (userId) => prisma.client.findUnique({
    where: { userID: userId },
    select: { clientID: true }
});

const resolveDeveloperProfile = async (userId) => prisma.developer.findUnique({
    where: { userID: userId },
    select: { developerID: true, hourlyRate: true, availabilityStatus: true }
});

const assertOpenContract = (contract) => {
    if (!contract || !['DRAFT', 'SIGNED'].includes(contract.status)) {
        const error = new Error('Contract is not open for hiring');
        error.statusCode = 400;
        throw error;
    }
};

const createAssignmentAndSign = async (tx, proposal, roleOverride) => {
    const role = roleOverride || proposal.role || 'Contributor';
    const proposedRate = proposal.proposedRate ? Number(proposal.proposedRate) : 0;

    const existingAssignment = await tx.contractAssignment.findUnique({
        where: {
            developerID_contractID: {
                developerID: proposal.developerID,
                contractID: proposal.contractID
            }
        }
    });

    if (existingAssignment) {
        const error = new Error('Developer already assigned to this contract');
        error.statusCode = 409;
        throw error;
    }

    const assignment = await tx.contractAssignment.create({
        data: {
            contractID: proposal.contractID,
            developerID: proposal.developerID,
            role,
            contributionPercentage: new Prisma.Decimal(0),
            paymentShare: new Prisma.Decimal(proposedRate)
        }
    });

    await tx.projectContract.update({
        where: { contractID: proposal.contractID },
        data: {
            status: 'SIGNED',
            signedDate: new Date()
        }
    });

    return assignment;
};

const createProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, proposedRate, role } = req.body;
        const developer = await resolveDeveloperProfile(req.user.userId);

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            select: { contractID: true, status: true, clientID: true }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        assertOpenContract(contract);

        const duplicate = await prisma.contractProposal.findUnique({
            where: {
                contractID_developerID: {
                    contractID: id,
                    developerID: developer.developerID
                }
            }
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'You already have a proposal or invite for this contract'
            });
        }

        const proposalData = {
            contractID: id,
            developerID: developer.developerID,
            source: 'DEVELOPER_PROPOSAL',
            status: 'PENDING',
            message: message || null,
            proposedRate: proposedRate !== undefined ? new Prisma.Decimal(proposedRate) : developer.hourlyRate,
            role: role || 'Contributor',
            declineReason: null,
            decidedAt: null
        };

        const proposal = await prisma.contractProposal.create({
            data: proposalData,
            include: contractInclude
        });

        const clientContact = proposal.contract?.client?.user;
        if (proposal.contract?.client?.userID) {
            try {
                await createNotification({
                    userID: proposal.contract.client.userID,
                    type: 'PROPOSAL_RECEIVED',
                    title: 'New proposal received',
                    body: `${proposal.developer?.user?.fullName || 'A developer'} submitted a proposal for ${proposal.contract?.title || 'your contract'}.`,
                    link: `/contracts/${proposal.contract.contractID}`
                });
            } catch (error) {
                console.error('Proposal notification error:', error);
            }
        }
        if (clientContact?.email) {
            const contractUrl = process.env.CLIENT_URL
                ? `${process.env.CLIENT_URL}/contracts/${proposal.contract.contractID}`
                : null;

            try {
                await sendProposalSubmittedEmail({
                    clientEmail: clientContact.email,
                    clientName: clientContact.fullName,
                    developerName: proposal.developer?.user?.fullName,
                    contractTitle: proposal.contract?.title,
                    message: proposal.message,
                    contractUrl
                });
            } catch (error) {
                console.error('Proposal notification email error:', error);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Proposal submitted successfully',
            data: proposal
        });
    } catch (error) {
        console.error('CreateProposal error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const listContractProposals = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await resolveClientProfile(req.user.userId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            select: { clientID: true }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        if (contract.clientID !== client.clientID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const proposals = await prisma.contractProposal.findMany({
            where: { contractID: id },
            include: contractInclude,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: proposals });
    } catch (error) {
        console.error('ListContractProposals error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const inviteDeveloper = async (req, res) => {
    try {
        const { id } = req.params;
        const { developerID, message, role } = req.body;
        const client = await resolveClientProfile(req.user.userId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const contract = await prisma.projectContract.findUnique({
            where: { contractID: id },
            select: { contractID: true, clientID: true, status: true }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        if (contract.clientID !== client.clientID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        assertOpenContract(contract);

        const developer = await prisma.developer.findUnique({
            where: { developerID }
        });

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer not found' });
        }

        const existingAssignment = await prisma.contractAssignment.findUnique({
            where: {
                developerID_contractID: {
                    developerID,
                    contractID: id
                }
            }
        });

        if (existingAssignment) {
            return res.status(409).json({ success: false, message: 'Developer already assigned to this contract' });
        }

        const existingProposal = await prisma.contractProposal.findUnique({
            where: {
                contractID_developerID: {
                    contractID: id,
                    developerID
                }
            }
        });

        if (existingProposal && existingProposal.status === 'PENDING' && existingProposal.source === 'CLIENT_INVITE') {
            return res.status(409).json({ success: false, message: 'Developer already has a pending invitation' });
        }

        const proposal = existingProposal
            ? await prisma.contractProposal.update({
                where: { proposalID: existingProposal.proposalID },
                data: {
                    source: 'CLIENT_INVITE',
                    status: 'PENDING',
                    message: message || existingProposal.message,
                    role: role || existingProposal.role || 'Contributor',
                    declineReason: null,
                    decidedAt: null,
                    createdAt: new Date()
                },
                include: contractInclude
            })
            : await prisma.contractProposal.create({
                data: {
                    contractID: id,
                    developerID,
                    source: 'CLIENT_INVITE',
                    status: 'PENDING',
                    message: message || null,
                    role: role || 'Contributor'
                },
                include: contractInclude
            });

        const developerContact = proposal.developer?.user;
        if (proposal.developer?.userID) {
            try {
                await createNotification({
                    userID: proposal.developer.userID,
                    type: 'INVITATION_RECEIVED',
                    title: 'You have a new contract invitation',
                    body: `${proposal.contract?.client?.user?.fullName || 'A client'} invited you to ${proposal.contract?.title || 'a contract'}.`,
                    link: `/contracts/${proposal.contract.contractID}`
                });
            } catch (error) {
                console.error('Invitation notification error:', error);
            }
        }
        if (developerContact?.email) {
            const contractUrl = process.env.CLIENT_URL
                ? `${process.env.CLIENT_URL}/contracts/${proposal.contract.contractID}`
                : null;

            try {
                await sendInvitationEmail({
                    developerEmail: developerContact.email,
                    developerName: developerContact.fullName,
                    clientName: proposal.contract?.client?.user?.fullName,
                    contractTitle: proposal.contract?.title,
                    message: proposal.message,
                    contractUrl
                });
            } catch (error) {
                console.error('Invitation email error:', error);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: proposal
        });
    } catch (error) {
        console.error('InviteDeveloper error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const acceptProposal = async (req, res) => {
    try {
        const { id, proposalId } = req.params;
        const client = await resolveClientProfile(req.user.userId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const proposal = await tx.contractProposal.findUnique({
                where: { proposalID: proposalId },
                include: {
                    contract: true
                }
            });

            if (!proposal || proposal.contractID !== id) {
                const error = new Error('Proposal not found');
                error.statusCode = 404;
                throw error;
            }

            if (proposal.contract.clientID !== client.clientID) {
                const error = new Error('Forbidden');
                error.statusCode = 403;
                throw error;
            }

            assertOpenContract(proposal.contract);

            if (proposal.source !== 'DEVELOPER_PROPOSAL') {
                const error = new Error('Only developer proposals can be accepted from this endpoint');
                error.statusCode = 400;
                throw error;
            }

            if (proposal.status !== 'PENDING') {
                const error = new Error('Proposal is no longer pending');
                error.statusCode = 409;
                throw error;
            }

            const assignment = await createAssignmentAndSign(tx, proposal);

            const acceptedProposal = await tx.contractProposal.update({
                where: { proposalID },
                data: {
                    status: 'ACCEPTED',
                    decidedAt: new Date(),
                    declineReason: null
                },
                include: contractInclude
            });

            return { assignment, proposal: acceptedProposal };
        });

        return res.status(200).json({
            success: true,
            message: 'Proposal accepted successfully',
            data: result
        });
    } catch (error) {
        console.error('AcceptProposal error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const declineProposal = async (req, res) => {
    try {
        const { id, proposalId } = req.params;
        const { declineReason } = req.body;
        const client = await resolveClientProfile(req.user.userId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client profile not found' });
        }

        const proposal = await prisma.contractProposal.findUnique({
            where: { proposalID: proposalId },
            include: {
                contract: true
            }
        });

        if (!proposal || proposal.contractID !== id) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        if (proposal.contract.clientID !== client.clientID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (proposal.source !== 'DEVELOPER_PROPOSAL') {
            return res.status(400).json({
                success: false,
                message: 'Only developer proposals can be declined from this endpoint'
            });
        }

        if (proposal.status !== 'PENDING') {
            return res.status(409).json({ success: false, message: 'Proposal is no longer pending' });
        }

        const updated = await prisma.contractProposal.update({
            where: { proposalID },
            data: {
                status: 'DECLINED',
                declineReason: declineReason || null,
                decidedAt: new Date()
            },
            include: contractInclude
        });

        return res.status(200).json({
            success: true,
            message: 'Proposal declined successfully',
            data: updated
        });
    } catch (error) {
        console.error('DeclineProposal error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const listMyProposals = async (req, res) => {
    try {
        const developer = await resolveDeveloperProfile(req.user.userId);

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }

        const proposals = await prisma.contractProposal.findMany({
            where: { developerID: developer.developerID },
            include: contractInclude,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: proposals });
    } catch (error) {
        console.error('ListMyProposals error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const developer = await resolveDeveloperProfile(req.user.userId);

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const proposal = await tx.contractProposal.findUnique({
                where: { proposalID: proposalId },
                include: {
                    contract: true
                }
            });

            if (!proposal) {
                const error = new Error('Invitation not found');
                error.statusCode = 404;
                throw error;
            }

            if (proposal.developerID !== developer.developerID) {
                const error = new Error('Forbidden');
                error.statusCode = 403;
                throw error;
            }

            if (proposal.source !== 'CLIENT_INVITE') {
                const error = new Error('Only client invitations can be accepted here');
                error.statusCode = 400;
                throw error;
            }

            assertOpenContract(proposal.contract);

            if (proposal.status !== 'PENDING') {
                const error = new Error('Invitation is no longer pending');
                error.statusCode = 409;
                throw error;
            }

            const assignment = await createAssignmentAndSign(tx, proposal, proposal.role);

            const acceptedInvite = await tx.contractProposal.update({
                where: { proposalID },
                data: {
                    status: 'ACCEPTED',
                    decidedAt: new Date(),
                    declineReason: null
                },
                include: contractInclude
            });

            return { assignment, proposal: acceptedInvite };
        });

        return res.status(200).json({
            success: true,
            message: 'Invitation accepted successfully',
            data: result
        });
    } catch (error) {
        console.error('AcceptInvitation error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

const declineInvitation = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const { declineReason } = req.body;
        const developer = await resolveDeveloperProfile(req.user.userId);

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }

        const proposal = await prisma.contractProposal.findUnique({
            where: { proposalID: proposalId }
        });

        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Invitation not found' });
        }

        if (proposal.developerID !== developer.developerID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (proposal.source !== 'CLIENT_INVITE') {
            return res.status(400).json({ success: false, message: 'Only invitations can be declined here' });
        }

        if (proposal.status !== 'PENDING') {
            return res.status(409).json({ success: false, message: 'Invitation is no longer pending' });
        }

        const updated = await prisma.contractProposal.update({
            where: { proposalID },
            data: {
                status: 'DECLINED',
                declineReason: declineReason || null,
                decidedAt: new Date()
            },
            include: contractInclude
        });

        return res.status(200).json({
            success: true,
            message: 'Invitation declined successfully',
            data: updated
        });
    } catch (error) {
        console.error('DeclineInvitation error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const withdrawProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const developer = await resolveDeveloperProfile(req.user.userId);

        if (!developer) {
            return res.status(404).json({ success: false, message: 'Developer profile not found' });
        }

        const proposal = await prisma.contractProposal.findUnique({
            where: { proposalID: proposalId }
        });

        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        if (proposal.developerID !== developer.developerID) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (proposal.source !== 'DEVELOPER_PROPOSAL') {
            return res.status(400).json({ success: false, message: 'Only developer proposals can be withdrawn' });
        }

        if (proposal.status !== 'PENDING') {
            return res.status(409).json({ success: false, message: 'Proposal is no longer pending' });
        }

        const updated = await prisma.contractProposal.update({
            where: { proposalID: proposalId },
            data: {
                status: 'WITHDRAWN',
                decidedAt: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Proposal withdrawn successfully',
            data: updated
        });
    } catch (error) {
        console.error('WithdrawProposal error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createProposal,
    listContractProposals,
    inviteDeveloper,
    acceptProposal,
    declineProposal,
    listMyProposals,
    acceptInvitation,
    declineInvitation,
    withdrawProposal
};
