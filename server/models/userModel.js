const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // The wallet address is the primary, unique identifier
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store addresses uniformly
        index: true      // Index for faster queries
    },
    // Optional username for display purposes
    username: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values but unique if provided
    },
    // Name and email are optional profile details, not for auth
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    // A user can have multiple roles
    roles: {
        type: [String],
        enum: ["author", "reviewer"],
        default: ["author"]
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;