import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { setUser } from "../services/auth.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, walletAddress, username } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !walletAddress || !username) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, username, email, password, role, walletAddress) are required",
      });
    }

    // Check if user already exists (email, username, or wallet address)
    const existingUser = await User.findOne({
      $or: [{ email }, { walletAddress }, { username }],
    });

    if (existingUser) {
      let conflictField = "";
      if (existingUser.email === email) conflictField = "email";
      else if (existingUser.walletAddress === walletAddress)
        conflictField = "wallet address";
      else if (existingUser.username === username) conflictField = "username";

      return res.status(400).json({
        success: false,
        message: `User with this ${conflictField} already exists`,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      username,
      walletAddress,
      password: hashedPassword,
      role,
    });

    // Verify user was created successfully
    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }

    // Generate token
    const token = setUser(newUser);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    process.env.PROJECT_MODE === "development" &&
      console.log("User registered successfully:", userResponse);

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Validate input - all fields are required
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Find user with all three identifiers
    const user = await User.findOne({
      email: email,
      walletAddress: walletAddress,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or wallet address doesn't match",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = setUser(user);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    process.env.PROJECT_MODE === "development" &&
      console.log("User logged in successfully:", userResponse);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser };
