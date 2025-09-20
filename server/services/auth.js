// service for verifying the jwt->getuser and setting/assigning the jwt during signup/login->setUser
const jwt=require("jsonwebtoken");
require('dotenv').config();   
const User=require("../models/User")
// stateless authentication
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
        return null; // Return null if token is invalid or expired
    }
}

module.exports={setUser,getUser};
