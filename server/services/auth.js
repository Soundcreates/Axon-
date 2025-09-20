
const jwt=require("jsonwebtoken");
require('dotenv').config();   
const User=require("../models/User")
const secret=process.env.KEY;

const setUser = (user) => {
    return jwt.sign({
        _id: user._id,
        email: user.email || null,          
        walletAddress: user.walletAddress || null, 
        role: user.role,
        loginMethod: user.loginMethod || 'email'
    }, secret, { expiresIn: "1h" });
};


const getUser=(token)=>{
    if (!token) return null;
    try{
        return jwt.verify(token,secret);
    }
    catch(err){
        return null; 
    }
}

module.exports={setUser,getUser};
