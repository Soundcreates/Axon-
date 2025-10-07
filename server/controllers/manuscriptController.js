import Manuscript from '../models/manuscriptModel.js';
import User from '../models/userModel.js';
import ipfsService, { fetchDocument } from '../services/ipfsService.js';
import mongoose from 'mongoose';

const submitManuscript = async (req, res) => {
  try {
    const {
      title,
      description,
      keywords,
      category,
      ipfsHash,
      contentHash,
      selectedReviewers,
      priority,
      stakingCost,
      transactionHash,
      blockchainId,
      manuscriptId,
      deadline
    } = req.body;

    //logging the manuscript data for debugging
    console.log("Received Manuscript data: ");
    console.log("Title: ", title);
    console.log("Description: ", description);
    console.log("Keywords: ", keywords);
    console.log("Category: ", category);
    console.log("IPFS Hash: ", ipfsHash);
    console.log("Content Hash: ", contentHash);
    console.log("Manuscript ID: ", manuscriptId);
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
      contentHash: contentHash || ipfsHash,  // Use contentHash if provided, fallback to ipfsHash
      author: userId,
      reviewers: reviewersArray,  // Use properly formatted reviewers array
      deadline: new Date(deadline),  // Add deadline field
      blockchain: {  // Structure blockchain data properly
        manuscriptId: manuscriptId || ipfsHash,  // Use provided manuscriptId or fallback to ipfsHash
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
            .populate('author', 'name email')
            .populate('reviewers.reviewer', 'name email');

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

const markReviewComplete = async (req, res) => {
    try {
        const { manuscriptId } = req.params;
        const { reviewComments } = req.body;
        const userId = req.user.id;

        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user is assigned as a reviewer
        const reviewerIndex = manuscript.reviewers.findIndex(
            r => r.reviewer.toString() === userId.toString()
        );

        if (reviewerIndex === -1) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned as a reviewer for this manuscript'
            });
        }

        // Validate review comments
        if (!reviewComments || !reviewComments.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Review comments are required'
            });
        }

        // Update the reviewer's status to completed and add review comments
        manuscript.reviewers[reviewerIndex].status = 'completed';
        manuscript.reviewers[reviewerIndex].reviewComments = reviewComments.trim();
        manuscript.reviewers[reviewerIndex].completedAt = new Date();
        
        // Check if all reviewers have completed their reviews
        const allReviewsComplete = manuscript.reviewers.every(
            r => r.status === 'completed'
        );

        // If all reviews are complete, update manuscript status
        if (allReviewsComplete) {
            manuscript.status = 'reviewed';
        }

        await manuscript.save();

        res.status(200).json({
            success: true,
            message: 'Review marked as complete',
            data: {
                manuscriptId: manuscript._id,
                userId: userId,
                allReviewsComplete: allReviewsComplete,
                manuscriptStatus: manuscript.status,
                completedReviews: manuscript.reviewers.filter(r => r.status === 'completed').length,
                totalReviewers: manuscript.reviewers.length
            }
        });

    } catch (error) {
        console.error('Error marking review as complete:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark review as complete'
        });
    }
};

const finalizeManuscriptReview = async (req, res) => {
    try {
        const { manuscriptId } = req.params;
        const { deadlinePassed, autoFinalized } = req.body;
        const userId = req.user.id;

        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check if user is the author (unless auto-finalized)
        if (!autoFinalized && manuscript.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the author can finalize the review process'
            });
        }

        // Check if all reviewers have completed their reviews
        const allReviewsComplete = manuscript.reviewers.every(
            r => r.status === 'completed'
        );

        // Allow finalization if all reviews are complete OR if deadline has passed OR if auto-finalized
        if (!allReviewsComplete && !deadlinePassed && !autoFinalized) {
            return res.status(400).json({
                success: false,
                message: 'Cannot finalize: not all reviews are complete and deadline has not passed'
            });
        }

        // Update manuscript status to reviewed
        manuscript.status = 'reviewed';
        manuscript.finalizedAt = new Date();
        manuscript.finalizedBy = userId;
        
        if (autoFinalized) {
            manuscript.finalizationReason = 'auto_finalized';
        } else if (deadlinePassed) {
            manuscript.finalizationReason = 'deadline_passed';
        } else {
            manuscript.finalizationReason = 'all_reviews_complete';
        }

        await manuscript.save();

        // Log incomplete reviewers for potential slashing
        const incompleteReviewers = manuscript.reviewers.filter(r => r.status !== 'completed');
        if (incompleteReviewers.length > 0) {
            console.log(`Manuscript ${manuscriptId} finalized with ${incompleteReviewers.length} incomplete reviewers:`, 
                incompleteReviewers.map(r => r.reviewer));
        }

        res.status(200).json({
            success: true,
            message: 'Manuscript review process finalized',
            data: {
                manuscriptId: manuscript._id,
                status: manuscript.status,
                completedReviews: manuscript.reviewers.filter(r => r.status === 'completed').length,
                totalReviewers: manuscript.reviewers.length,
                incompleteReviewers: incompleteReviewers.length,
                finalizationReason: manuscript.finalizationReason
            }
        });

    } catch (error) {
        console.error('Error finalizing manuscript review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to finalize manuscript review'
        });
    }
};

const fetchManuscriptDocument = async (req, res) => {
    try {
        const { manuscriptId } = req.params;

        // First, get the manuscript to verify access and get content hash
        const manuscript = await Manuscript.findById(manuscriptId)
            .populate('author', 'name email')
            .populate('reviewers.reviewer', 'name email');

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

        // Fetch document from IPFS using the content hash
        const documentResult = await fetchDocument(manuscript.contentHash);

        if (documentResult.success && documentResult.accessible) {
            res.status(200).json({
                success: true,
                message: 'Document fetched successfully',
                data: {
                    manuscriptId: manuscript._id,
                    title: manuscript.title,
                    contentHash: manuscript.contentHash,
                    documentUrl: documentResult.documentUrl,
                    accessible: documentResult.accessible,
                    contentType: documentResult.contentType,
                    contentLength: documentResult.contentLength
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Document not accessible',
                error: documentResult.error || 'Document could not be fetched from IPFS',
                data: {
                    manuscriptId: manuscript._id,
                    contentHash: manuscript.contentHash,
                    accessible: false
                }
            });
        }

    } catch (error) {
        console.error('Error fetching manuscript document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manuscript document',
            error: error.message
        });
    }
};

export {
    submitManuscript,
    getManuscripts,
    assignReviewers,
    getManuscriptDetails,
    markReviewComplete,
    finalizeManuscriptReview,
    fetchManuscriptDocument
};