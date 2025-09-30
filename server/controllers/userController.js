import User from '../models/userModel.js';
import uploadFile from '../services/ipfsService.js';
import multer, { memoryStorage } from 'multer';

//configuring multer

const storage = multer.memoryStorage();
const upload =multer({storage : storage})

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




export const ipfsUpload = async (req, res) => {
  console.log(req.file);
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "File buffer is missing"
      });
    }
    
    console.log("File received:", req.file.originalname, req.file.size, "bytes");

    const result = await uploadFile(req.file);
    
    res.status(200).json({
      success: true,
      message: "File uploaded to IPFS successfully",
      ipfsHash: result.ipfsHash,
      pinataUrl: result.pinataUrl,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error("IPFS upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file to IPFS",
      error: error.message
    });
  }
};

export const listReviewers = async (req,res) => {
  try {
    const reviewers = await User.find({role: "reviewer"}).select('-password');
    if(!reviewers || reviewers.length === 0) {
      console.log("No reviewers")
      return res.status(404).json({message: "No reviewers available"});
    }
    return res.status(200).json({reviewers: reviewers});
  } catch (error) {
    console.error("Error in listReviewers:", error);
    return res.status(500).json({message: "Internal Server Error in listReviewers"});
  }
}
export {upload};