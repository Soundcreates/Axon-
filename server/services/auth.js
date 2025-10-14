
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/userModel.js";

dotenv.config();   
const secret = process.env.JWT_SECRET;

const setUser = (user) => {
    if (!user || !user._id) {
        throw new Error("Invalid user object provided to setUser");
    }
    
    return jwt.sign({
        id: user._id,
        email: user.email || null,          
        walletAddress: user.walletAddress || null, 
        role: user.role || null,
        name: user.name || null,
        loginMethod: user.loginMethod || 'email'
    }, secret || process.env.JWT_SECRET, { expiresIn: "1h" });
};

const getUser = (token) => {
    if (!token) return null;
    try{
        return jwt.verify(token, secret);
    }
    catch(err){
        return null; 
    }
}

export { setUser, getUser };
