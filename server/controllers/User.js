const jwt=require("jsonwebtoken");
const bcrypt=require('bcrypt') 
const User=require ("../models/User.js");
const {setUser}=require("../services/auth.js");
const Web3AuthService = require('../services/web3Auth');



const handleWalletAuth = async (req, res) => {
  try {
      const { walletAddress, signature, nonce, role } = req.body;
      
      if (!walletAddress || !signature || !nonce) {
          return res.status(400).json({ message: "Wallet address, signature, and nonce required" });
      }
      
      if (!role || (role !== "vendor" && role !== "seller")) {
          return res.status(400).json({ message: "Invalid role" });
      }
      
      // Verify signature
      const isValidSignature = Web3AuthService.verifyWalletSignature(walletAddress, signature, nonce);
      if (!isValidSignature) {
          return res.status(400).json({ message: "Invalid signature" });
      }
      
      const formattedAddress = Web3AuthService.formatWalletAddress(walletAddress);
      
      // Check if user exists
      let user = await User.findOne({ walletAddress: formattedAddress });
      
      if (!user) {
          // Create new user
          user = await User.create({
              walletAddress: formattedAddress,
              role: role,
              loginMethod: 'wallet',
              name: `User_${formattedAddress.substring(0, 8)}` // Default name
          });
      }
      
      const token = setUser(user);
      
      return res.status(200).json({
          token: token,
          message: "Wallet authentication successful",
          user: {
              id: user._id,
              walletAddress: user.walletAddress,
              role: user.role,
              name: user.name
          }
      });
      
  } catch (err) {
      console.log("Error in wallet auth:", err);
      return res.status(500).json({ message: "Internal Server Error: Wallet Auth" });
  }
};

const generateNonce = async (req, res) => {
  try {
      const nonce = Web3AuthService.generateNonce();
      
      // Store nonce temporarily (you might want to use Redis for production)
      // For now, just return it - frontend will send it back
      return res.status(200).json({
          nonce: nonce,
          message: `Please sign this message to authenticate: ${nonce}`
      });
      
  } catch (err) {
      console.log("Error generating nonce:", err);
      return res.status(500).json({ message: "Internal Server Error: Nonce Generation" });
  }
};

const handleUserLogin=async(req,res)=>{ 
  try{
    const{email,password}=req.body;
    if(!email||!password) return res.json({message:"All details required"}).status(400);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" }).status(400);
    
    const passCheck=await bcrypt.compare(password,user.password);   

    const token=setUser(user);

    return res.status(200).json({ token: token, message: "Login Successful Yay Bitches" }).status(200);
  
  }
  catch(err){
    console.log("Error in UserLogin",err);
    return res.json({message:"Internal Server Error: UserLogin"}).status(500)
  }
}



const handleUserSignup=async(req,res)=>{ // option of signing in as vendor/ seller
  try{
  const{name,email,password,role}=req.body;
  if(!name||!email||!password) return res.json({message:"All details required"}).status(400);

  const hashedPassword=await bcrypt.hash(password,10);  // password gets hashed with a salt 10 times and then stored in DB. 

    await User.create({
      name:name,
      email:email,
      password:hashedPassword,
      role:role
    })

    return res.status(200).json({message:"Signup Successfull, account is created; now Login"}).redirect("/login")
  }
catch(err){
  console.log("Error in Generating user",err);
  return res.json({message:"Internal Server Error: UserSignup"}).status(500)
}
}



const handleUserLogout=(req,res)=>{
      // logout will be from frontend side=>   localStorage.removeItem('token');
  // or
  sessionStorage.removeItem('token');
  // then redirect to login page
  window.location = '/login';

    return res.json({ message: "Logout successful. Please remove the token on the client." });        
}

module.exports={handleUserLogin,handleUserSignup,handleUserLogout,handleWalletAuth,generateNonce};