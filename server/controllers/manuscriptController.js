const Manuscript = require('../models/manuscriptModel');
const User = require('../models/userModel');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');

const submitManuscript = async (req, res) => {
    try {
        const { title, abstract, keywords, category, coAuthors } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Manuscript file is required'
            });
        }

        // Upload to IPFS
        const contentHash = await ipfsService.uploadBuffer(
            req.file.buffer,
            req.file.originalname
        );

        // Create manuscript
        const manuscript = new Manuscript({
            title,
            abstract,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            category,
            author: req.user._id,
            coAuthors: coAuthors || [],
            contentHash,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            metadata: {
                fileSize: req.file.size,
                fileName: req.file.originalname,
                mimeType: req.file.mimetype
            }
        });

        await manuscript.save();

        // Submit to blockchain
        try {
            const blockchainResult = await blockchainService.submitManuscript(
                contentHash,
                title,
                req.user.walletAddress
            );
            
            manuscript.blockchain = {
                manuscriptId: blockchainResult.manuscriptId,
                transactionHash: blockchainResult.transactionHash,
                blockNumber: blockchainResult.blockNumber
            };
            
            manuscript.status = 'submitted';
            await manuscript.save();
        } catch (blockchainError) {
            console.error('Blockchain submission failed:', blockchainError);
            // Continue without blockchain if it fails
        }

        res.status(201).json({
            success: true,
            message: 'Manuscript submitted successfully',
            data: manuscript
        });

    } catch (error) {
        console.error('Error submitting manuscript:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit manuscript',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getManuscripts = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;

        // For authors: show their own manuscripts
        // For reviewers: show manuscripts assigned to them
        if (req.user.role === 'author') {
            filter.author = req.user._id;
        } else if (req.user.role === 'reviewer') {
            filter['reviewers.reviewer'] = req.user._id;
        }

        const manuscripts = await Manuscript.find(filter)
            .populate('author', 'name email')
            .populate('reviewers.reviewer', 'name email reputation')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Manuscript.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                manuscripts,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Error fetching manuscripts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manuscripts'
        });
    }
};

const assignReviewers = async (req, res) => {
    try {
        const { manuscriptId } = req.params;
        const { reviewerIds } = req.body;

        const manuscript = await Manuscript.findById(manuscriptId);
        
        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user is the author
        if (manuscript.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the author can assign reviewers'
            });
        }

        // Validate reviewers
        const reviewers = await User.find({
            _id: { $in: reviewerIds },
            role: 'reviewer'
        });

        if (reviewers.length !== reviewerIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some reviewer IDs are invalid'
            });
        }

        // Assign reviewers
        manuscript.reviewers = reviewerIds.map(reviewerId => ({
            reviewer: reviewerId,
            assignedAt: new Date(),
            status: 'assigned'
        }));

        manuscript.status = 'under_review';
        await manuscript.save();

        // Submit to blockchain
        try {
            await blockchainService.assignReviewers(
                manuscript.blockchain.manuscriptId,
                reviewers.map(r => r.walletAddress)
            );
        } catch (blockchainError) {
            console.error('Blockchain reviewer assignment failed:', blockchainError);
        }

        res.status(200).json({
            success: true,
            message: 'Reviewers assigned successfully',
            data: manuscript
        });

    } catch (error) {
        console.error('Error assigning reviewers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign reviewers'
        });
    }
};

const getManuscriptDetails = async (req, res) => {
    try {
        const { manuscriptId } = req.params;

        const manuscript = await Manuscript.findById(manuscriptId)
            .populate('author', 'name email reputation')
            .populate('reviewers.reviewer', 'name email reputation')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'reviewer',
                    select: 'name email'
                }
            });

        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check access permissions
        const isAuthor = manuscript.author._id.toString() === req.user._id.toString();
        const isAssignedReviewer = manuscript.reviewers.some(
            r => r.reviewer._id.toString() === req.user._id.toString()
        );

        if (!isAuthor && !isAssignedReviewer && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: manuscript
        });

    } catch (error) {
        console.error('Error fetching manuscript details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manuscript details'
        });
    }
};

module.exports = {
    submitManuscript,
    getManuscripts,
    assignReviewers,
    getManuscriptDetails
};