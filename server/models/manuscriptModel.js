import mongoose from 'mongoose';

const manuscriptSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    abstract: {
        type: String,
        required: true,
        maxlength: 1000
    },
    keywords: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['Machine Learning', 'Computer Vision', 'Natural Language Processing', 'Robotics', 'Quantum Computing', 'Bioinformatics', 'Cryptography', 'Software Engineering']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coAuthors: [{
        name: String,
        email: String,
        affiliation: String
    }],
    contentHash: {
        type: String,
        required: true, // IPFS hash
        unique: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'reviewed', 'accepted', 'rejected', 'published'],
        default: 'draft'
    },
    reviewers: [{
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['assigned', 'accepted', 'declined', 'completed'],
            default: 'assigned'
        }
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    deadline: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        fileSize: Number,
        fileName: String,
        mimeType: String
    },
    blockchain: {
        manuscriptId: String, // blockchain manuscript ID (cid that we get from ipfs)
        transactionHash: String,
        blockNumber: Number
    }
}, {
    timestamps: true
});

// Indexes for better query performance
manuscriptSchema.index({ author: 1, status: 1 });
manuscriptSchema.index({ 'reviewers.reviewer': 1 });
manuscriptSchema.index({ category: 1, status: 1 });
manuscriptSchema.index({ submittedAt: -1 });

export default mongoose.model('Manuscript', manuscriptSchema);