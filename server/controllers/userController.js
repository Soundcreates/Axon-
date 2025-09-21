import User from '../models/userModel.js';
import uploadFile from '../services/ipfsService.js';

export const getUserProfile = async (req,res) => {
  try{
    const userId = req.user.id;
    if(!userId){
      return res.status(400).json({message: "User ID not found in request"});
    }

    const foundUser =  await User.findById(userId).select('-password');
    if(!foundUser){
      return res.status(404).json({message: "User not found"});
    }

    return res.status(200).json({user: foundUser});
  }catch(err){
    console.log("Error in getUserProfile", err);
    return res.status(500).json({message: "Internal Server Error in getUserProfile"});
  }
}




export const ipfsUpload = async (req,res) => {
  
    if(!req.file) {
      return res.status(400).json({message: "No file uploaded"});
    }
  try{
    const fileBuffer = req.file.buffer;
    const ipfsHash = await uploadFile(fileBuffer);
    return res.status(200).json({ipfsHash: ipfsHash});
  }catch(err){
    console.log("Error in ipfsUpload", err);
    return res.status(500).json({message: "Internal Server Error in ipfsUpload"});
  }
}

export const listReviewers = async (req,res) => {
  const reviewers = User.find({role: "reviewer"});
  if(!reviewers) return res.status(400).json({message: "No reviewers available"});
  return res.status(200).json({reviewers: reviewers})

}