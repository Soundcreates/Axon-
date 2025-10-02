import Manuscript from '../models/manuscriptModel.js';
import User from '../models/userModel.js';
import ipfsService from '../services/ipfsService.js';
import mongoose from 'mongoose';

const submitManuscript = async (req, res) => {
  try {
    const {
      title,
      description,
      keywords,
      category,
      ipfsHash,
      selectedReviewers,
      priority,
      stakingCost,
      transactionHash,
      blockchainId,
      deadline
    } = req.body;

    //logging the manuscript data for debugging
    console.log("Received Manuscript data: ");
    console.log("Title: ", title);
    console.log("Description: ", description);
    console.log("Keywords: ", keywords);
    console.log("Category: ", category);
    console.log("IPFS Hash: ", ipfsHash);
    console.log("Selected Reviewers: ", selectedReviewers);
    console.log("Priority: ", priority);
    console.log("Staking Cost: ", stakingCost);
    console.log("Transaction Hash: ", transactionHash);
    console.log("Blockchain ID: ", blockchainId);
    console.log("Deadline: ", deadline);

    const userId = req.user.id;

    // Convert keywords string to array if it's a string
    const keywordsArray = typeof keywords === 'string' 
      ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : keywords;

    // Convert selectedReviewers array to proper format and validate ObjectIds
    const reviewersArray = selectedReviewers.map(reviewerId => {
      // Validate if it's a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
        throw new Error(`Invalid reviewer ID: ${reviewerId}. Must be a valid MongoDB ObjectId.`);
      }
      return {
        reviewer: reviewerId,
        assignedAt: new Date(),
        status: 'assigned'
      };
    });

    const manuscript = await Manuscript.create({
      title,
      abstract: description,  // Map description to abstract
      keywords: keywordsArray,  // Use processed keywords array
      category,
      contentHash: ipfsHash,  // Map ipfsHash to contentHash
      author: userId,
      reviewers: reviewersArray,  // Use properly formatted reviewers array
      deadline: new Date(deadline),  // Add deadline field
      blockchain: {  // Structure blockchain data properly
        manuscriptId: ipfsHash,  // Use IPFS hash as manuscript ID
        transactionHash,
        blockNumber: blockchainId
      },
      status: 'submitted',
      submittedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Manuscript submitted successfully",
      manuscript: manuscript
    });

  } catch (error) {
    console.error("Error submitting manuscript:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit manuscript",
      error: error.message
    });
  }
};
const getManuscripts = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;

        // Debug logging
        console.log('User requesting manuscripts:', {
            userId: req.user.id,
            userRole: req.user.role,
            userEmail: req.user.email
        });

        // Role-based filtering
        if (req.user.role === 'author') {
            // Authors only see their own manuscripts
            filter.author = req.user.id;
            console.log('Filtering for author - showing only manuscripts by user:', req.user.id);
            console.log('Author ObjectId type:', typeof req.user.id);
        } else if (req.user.role === 'reviewer') {
            // Reviewers only see manuscripts assigned to them
            filter['reviewers.reviewer'] = req.user.id;
            console.log('Filtering for reviewer - showing only manuscripts assigned to user:', req.user.id);
        } else {
            // For admin or other roles, show all manuscripts
            console.log('User has admin/other role - showing all manuscripts');
        }

        // TEMPORARY: Also check what manuscripts exist for this author
        if (req.user.role === 'author') {
            const allUserManuscripts = await Manuscript.find({ author: req.user.id });
            console.log('All manuscripts by this author:', allUserManuscripts.length);
            if (allUserManuscripts.length > 0) {
                console.log('Sample manuscript:', {
                    id: allUserManuscripts[0]._id,
                    title: allUserManuscripts[0].title,
                    author: allUserManuscripts[0].author
                });
            }
        }

        console.log('Filter being used:', filter);
        
        // Check total manuscripts in database without any filter
        const totalInDB = await Manuscript.countDocuments({});
        console.log('Total manuscripts in entire database:', totalInDB);
        
        const manuscripts = await Manuscript.find(filter)
            .populate('author', 'name email')
            .populate('reviewers.reviewer', 'name email reputation')
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Manuscript.countDocuments(filter);
        
        console.log('Found manuscripts:', manuscripts.length);
        console.log('Total manuscripts in DB:', total);

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
        if (manuscript.author.toString() !== req.user.id.toString()) {
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
        const isAuthor = manuscript.author._id.toString() === req.user.id.toString();
        const isAssignedReviewer = manuscript.reviewers.some(
            r => r.reviewer._id.toString() === req.user.id.toString()
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

export {
    submitManuscript,
    getManuscripts,
    assignReviewers,
    getManuscriptDetails
};