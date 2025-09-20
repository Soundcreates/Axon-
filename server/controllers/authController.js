const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { setUser } = require("../services/auth");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, walletAddress } = req.body;

        // Validation
        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: "Name and role are required"
            });
        }

        if (!email && !walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Either email or wallet address is required"
            });
        }

        // Check for existing user
        let existingUser;
        if (email) {
            existingUser = await User.findOne({ email});
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }
        }


        // Create user object
        const userData = {
            name,
            role,
            loginMethod: email ? 'email' : 'wallet'
        };

        if (email) {
            userData.email = email.toLowerCase();
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for email registration"
                });
            }
            userData.password = await bcrypt.hash(password, 12);
        }

        if (walletAddress) {
            userData.walletAddress = walletAddress.toLowerCase();
        }

        // Create user
        const user = new User(userData);
        await user.save();

        // Generate token
        const token = setUser(user);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error("Error in registerUser:", error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Check password
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required"
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
        } else {
            user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Wallet address not found"
                });
            }
        }

        // Generate token
        const token = setUser(user);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};