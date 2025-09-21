import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // The wallet address is the primary, unique identifier
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store addresses uniformly
        index: true      // Index for faster queries
    },
    // Required username for display purposes
    username: {
        type: String,
        required: true,
        unique: true
    },
    // Required name and email
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Required password for authentication
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    // Single role (required)
    role: {
        type: String,
        enum: ["author", "reviewer"],
        required: true
    },

    rep: {
        type: Number,
        default : 0,
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;