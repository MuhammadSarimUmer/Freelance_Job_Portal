const prisma = require('../config/prisma');

const getTechnologies = async (req, res) => {
    try {
        const techs = await prisma.technologyStack.findMany();

        res.status(200).json({
            success: true,
            data: techs
        });

    } catch (error) {
        console.error('GetTechnologies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const createTechnology = async (req, res) => {
    try {
        const { techName, category, version } = req.body;

        const tech = await prisma.technologyStack.create({
            data: {
                techName,
                category,
                version: version || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Technology created successfully',
            data: tech
        });

    } catch (error) {
        console.error('CreateTechnology error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const addSkill = async (req, res) => {
    try {
        const { techID, proficiencyLevel, yearsExperience } = req.body;

        const developer = await prisma.developer.findUnique({
            where: { userID: req.user.userId }
        });

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer profile not found'
            });
        }

        const skill = await prisma.developerTechnology.create({
            data: {
                developerID: developer.developerID,
                techID,
                proficiencyLevel,
                yearsExperience: yearsExperience || 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Skill added successfully',
            data: skill
        });
        
    } catch (error) {
        console.error('AddSkill error:', error);

        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'Skill already exists for this developer'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateSkill = async (req, res) => {
    try {
        const { techID } = req.params;
        const { proficiencyLevel, yearsExperience } = req.body;

        if (!proficiencyLevel && yearsExperience === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Nothing to update'
            });
        }

        const developer = await prisma.developer.findUnique({
            where: { userID: req.user.userId }
        });

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer profile not found'
            });
        }

        const updated = await prisma.developerTechnology.update({
            where: {
                developerID_techID: {
                    developerID: developer.developerID,
                    techID: techID
                }
            },
            data: {
                ...(proficiencyLevel && { proficiencyLevel }),
                ...(yearsExperience !== undefined && { yearsExperience })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Skill updated successfully',
            data: updated
        });

    } catch (error) {
        console.error('UpdateSkill error:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const { techID } = req.params;

        const developer = await prisma.developer.findUnique({
            where: { userID: req.user.userId }
        });

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: 'Developer profile not found'
            });
        }

        await prisma.developerTechnology.delete({
            where: {
                developerID_techID: {
                    developerID: developer.developerID,
                    techID: techID
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Skill deleted successfully'
        });

    } catch (error) {
        console.error('DeleteSkill error:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getTechnologies,
    createTechnology,
    addSkill,
    updateSkill,
    deleteSkill
};