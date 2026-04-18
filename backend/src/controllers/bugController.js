const prisma = require('../config/prisma');

const VALID_BUG_SEVERITY = ['LOW', 'MINOR', 'MAJOR', 'CRITICAL'];
const VALID_BUG_STATUS = ['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// Helper: verify the requesting user has access to the contract a bug belongs to
const verifyBugAccess = async (bugID, userId, role) => {
    const bug = await prisma.bugReport.findUnique({
        where: { bugID },
        include: {
            contract: {
                select: {
                    clientID: true,
                    assignments: { select: { developerID: true } }
                }
            }
        }
    });

    if (!bug) return { error: 'Bug report not found', status: 404 };

    if (role === 'CLIENT') {
        const client = await prisma.client.findUnique({
            where: { userID: userId },
            select: { clientID: true }
        });

        if (!client || bug.contract.clientID !== client.clientID) {
            return { error: 'Forbidden - You do not own this contract', status: 403 };
        }
    }

    if (role === 'DEVELOPER') {
        const developer = await prisma.developer.findUnique({
            where: { userID: userId },
            select: { developerID: true }
        });

        const isAssigned = bug.contract.assignments.some(
            a => a.developerID === developer?.developerID
        );

        if (!developer || !isAssigned) {
            return { error: 'Forbidden - You are not assigned to this contract', status: 403 };
        }
    }

    return { bug };
};

const createBug = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { contractID, title, description, severity } = req.body;

        if (!contractID || !title || !description || !severity) {
            return res.status(400).json({
                success: false,
                message: 'contractID, title, description, and severity are required'
            });
        }

        if (!VALID_BUG_SEVERITY.includes(severity)) {
            return res.status(400).json({
                success: false,
                message: `Invalid severity. Must be one of: ${VALID_BUG_SEVERITY.join(', ')}`
            });
        }

        // Verify the user has access to this contract
        const contract = await prisma.projectContract.findUnique({
            where: { contractID },
            select: {
                clientID: true,
                assignments: { select: { developerID: true } }
            }
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        if (role === 'CLIENT') {
            const client = await prisma.client.findUnique({
                where: { userID: userId },
                select: { clientID: true }
            });

            if (!client || contract.clientID !== client.clientID) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden - You do not own this contract'
                });
            }
        }

        if (role === 'DEVELOPER') {
            const developer = await prisma.developer.findUnique({
                where: { userID: userId },
                select: { developerID: true }
            });

            const isAssigned = contract.assignments.some(
                a => a.developerID === developer?.developerID
            );

            if (!developer || !isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden - You are not assigned to this contract'
                });
            }
        }

        const bug = await prisma.bugReport.create({
            data: {
                contractID,
                title: title.trim(),
                description,
                severity,
                status: 'REPORTED'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Bug report created successfully',
            data: bug
        });

    } catch (error) {
        console.error('CreateBug error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getBugs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { contractID, severity, status } = req.query;
        const page = Math.max(parseInt(req.query.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
        const skip = (page - 1) * limit;

        let whereClause = {};

        if (contractID) whereClause.contractID = contractID;
        if (severity) whereClause.severity = severity;
        if (status) whereClause.status = status;

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

            whereClause.contract = {
                ...whereClause.contract,
                clientID: client.clientID
            };
        }

        if (role === 'DEVELOPER') {
            whereClause.contract = {
                ...whereClause.contract,
                assignments: { some: { developerID: userId } }
            };
        }

        const [bugs, total] = await Promise.all([
            prisma.bugReport.findMany({
                where: whereClause,
                include: {
                    contract: {
                        select: { contractID: true, title: true, status: true }
                    }
                },
                orderBy: { createdDate: 'desc' },
                skip,
                take: limit
            }),
            prisma.bugReport.count({ where: whereClause })
        ]);

        return res.status(200).json({
            success: true,
            data: bugs,
            meta: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('GetBugs error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateBug = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;

        const access = await verifyBugAccess(id, userId, role);
        if (access.error) {
            return res.status(access.status).json({
                success: false,
                message: access.error
            });
        }

        if (access.bug.status === 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a closed bug report'
            });
        }

        const allowedFields = ['title', 'description', 'severity'];
        let updateData = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                if (key === 'severity' && !VALID_BUG_SEVERITY.includes(req.body[key])) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid severity. Must be one of: ${VALID_BUG_SEVERITY.join(', ')}`
                    });
                }
                if (key === 'title') {
                    updateData[key] = req.body[key].trim();
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

        const updated = await prisma.bugReport.update({
            where: { bugID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Bug report updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateBug error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateBugStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;
        const { status } = req.body;

        if (!status || !VALID_BUG_STATUS.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_BUG_STATUS.join(', ')}`
            });
        }

        const access = await verifyBugAccess(id, userId, role);
        if (access.error) {
            return res.status(access.status).json({
                success: false,
                message: access.error
            });
        }

        const updateData = { status };

        if (status === 'RESOLVED' || status === 'CLOSED') {
            updateData.resolvedDate = new Date();
        }

        const updated = await prisma.bugReport.update({
            where: { bugID: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: 'Bug status updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateBugStatus error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteBug = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;

        const access = await verifyBugAccess(id, userId, role);
        if (access.error) {
            return res.status(access.status).json({
                success: false,
                message: access.error
            });
        }

        await prisma.bugReport.delete({
            where: { bugID: id }
        });

        return res.status(200).json({
            success: true,
            message: 'Bug report deleted successfully'
        });

    } catch (error) {
        console.error('DeleteBug error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createBug,
    getBugs,
    updateBug,
    updateBugStatus,
    deleteBug
};
