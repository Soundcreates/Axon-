import Review from '../models/reviewModel.js';
import Manuscript from '../models/manuscriptModel.js';
import User from '../models/userModel.js';
import ipfsService from '../services/ipfsService.js';
import blockchainService from '../services/blockchainService.js';

const submitReview = async (req, res) => {
    try {
        const { manuscriptId } = req.params;
        const { scores, comments, recommendation, confidential = false } = req.body;

        // Validate manuscript and reviewer assignment
        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        const isAssignedReviewer = manuscript.reviewers.some(
            r => r.reviewer.toString() === req.user.id.toString()
        );

        if (!isAssignedReviewer) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned as a reviewer for this manuscript'
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            manuscript: manuscriptId,
            reviewer: req.user.id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted a review for this manuscript'
            });
        }

        // Create review document for IPFS
        const reviewDocument = {
            manuscriptId,
            reviewer: req.user.id,
            scores,
            comments,
            recommendation,
            submittedAt: new Date(),
            reviewerInfo: {
                name: req.user.name,
                reputation: req.user.reputation || 0
            }
        };

        // Upload review to IPFS
        const reviewHash = await ipfsService.uploadJSON(reviewDocument);

        // Create review record
        const review = new Review({
            manuscript: manuscriptId,
            reviewer: req.user.id,
            reviewHash,
            scores,
            comments,
            recommendation,
            confidential
        });

        await review.save();

        // Update manuscript
        manuscript.reviews.push(review._id);
        
        // Update reviewer status
        const reviewerIndex = manuscript.reviewers.findIndex(
            r => r.reviewer.toString() === req.user.id.toString()
        );
        manuscript.reviewers[reviewerIndex].status = 'completed';

        // Check if all reviews are completed
        const allCompleted = manuscript.reviewers.every(r => r.status === 'completed');
        if (allCompleted) {
            manuscript.status = 'reviewed';
        }

        await manuscript.save();

        // Update reviewer reputation
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { reputation: 10 }
        });

        // Note: Blockchain review submission is handled by the frontend
        // The frontend will call peerReview_stakeForReview and peerReview_submitReview directly

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review'
        });
    }
};

const getReviews = async (req, res) => {
    try {
        const { manuscriptId } = req.params;

        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            return res.status(404).json({
                success: false,
                message: 'Manuscript not found'
            });
        }

        // Check access permissions
        const isAuthor = manuscript.author.toString() === req.user.id.toString();
        const isAssignedReviewer = manuscript.reviewers.some(
            r => r.reviewer.toString() === req.user.id.toString()
        );

        if (!isAuthor && !isAssignedReviewer) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const reviews = await Review.find({ manuscript: manuscriptId })
            .populate('reviewer', 'name email reputation')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = { reviewer: req.user.id };

        const reviews = await Review.find(filter)
            .populate({
                path: 'manuscript',
                select: 'title author status submittedAt',
                populate: {
                    path: 'author',
                    select: 'name email'
                }
            })
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Error fetching my reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your reviews'
        });
    }
};

export {
    submitReview,
    getReviews,
    getMyReviews
};