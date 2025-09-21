import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { setUser } from "../services/auth.js";

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
            existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }
        }

        if (walletAddress) {
            existingUser = await User.findOne({ walletAddress });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this wallet address already exists"
                });
            }
        }

        // Create user object
        const userData = {
            name,
            roles: [role] // Note: using 'roles' array as per your model
        };

        if (email && password && !walletAddress) {
            userData.email = email;
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for email registration"
                });
            }
            userData.password = await bcrypt.hash(password, 12);
            userData.loginMethod = 'email';
        }

        if (walletAddress && !password) {
            userData.walletAddress = walletAddress;
            userData.loginMethod = 'wallet';
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
        const { email, password, walletAddress} = req.body;

        // Validate input - either email+password OR walletAddress
        if (!email && !walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Either email or wallet address is required"
            });
        }

        if (email && !password) {
            return res.status(400).json({
                success: false,
                message: "Password is required for email login"
            });
        }

        // Find user
        let user;
        
        if (email) {
            // Email-based login
            user = await User.findOne({ email});
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Check if user has a password (some users might be wallet-only)
            if (!user.password) {
                return res.status(401).json({
                    success: false,
                    message: "This account was created with wallet login. Please use wallet to login."
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
        } else if (walletAddress) {
            // Wallet-based login
            user = await User.findOne({ walletAddress: walletAddress });
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

export {
    registerUser,
    loginUser
};