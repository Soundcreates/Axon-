import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    manuscript: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manuscript',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewHash: {
        type: String,
        required: true // IPFS hash of the review document
    },
    scores: {
        originality: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        },
        methodology: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        },
        clarity: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        },
        significance: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        },
        overall: {
            type: Number,
            min: 1,
            max: 10,
            required: true
        }
    },
    comments: {
        summary: {
            type: String,
            required: true,
            maxlength: 1000
        },
        strengths: {
            type: String,
            maxlength: 500
        },
        weaknesses: {
            type: String,
            maxlength: 500
        },
        suggestions: {
            type: String,
            maxlength: 500
        }
    },
    recommendation: {
        type: String,
        enum: ['accept', 'minor_revision', 'major_revision', 'reject'],
        required: true
    },
    confidential: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    blockchain: {
        transactionHash: String,
        blockNumber: Number,
        stakeAmount: Number,
        staked: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Compound index to ensure one review per reviewer per manuscript
reviewSchema.index({ manuscript: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);