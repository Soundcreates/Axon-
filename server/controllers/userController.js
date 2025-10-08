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

    return res.status(200).json({success: true, user: foundUser});
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

export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in request"
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user's token information
    const userTokenInfo = {
      earnedTokens: user.earnedTokens || 0,
      stakedTokens: user.stakedTokens || 0
    };

    // Import Manuscript model dynamically to avoid circular imports
    const { default: Manuscript } = await import('../models/manuscriptModel.js');
    const { default: Review } = await import('../models/reviewModel.js');

    // Calculate statistics based on user role
    let stats = {
      reputation: user.rep || 0,
      totalReviews: 0,
      activeReviews: 0,
      avgReviewTime: 0,
      qualityRating: 0,
      recentActivity: [],
      expertise: [],
      totalTokens: userTokenInfo.earnedTokens + userTokenInfo.stakedTokens,
      stakedTokens: userTokenInfo.stakedTokens,
      earnedTokens: userTokenInfo.earnedTokens
    };

    if (user.role === 'reviewer') {
      // Get reviewer-specific stats
      const reviewerManuscripts = await Manuscript.find({
        'reviewers.reviewer': userId
      }).populate('author', 'name email');

      stats.totalReviews = reviewerManuscripts.length;
      stats.activeReviews = reviewerManuscripts.filter(m => 
        m.reviewers.find(r => r.reviewer.toString() === userId.toString())?.status === 'assigned'
      ).length;

      // Calculate average review time (simplified)
      const completedReviews = reviewerManuscripts.filter(m => 
        m.reviewers.find(r => r.reviewer.toString() === userId.toString())?.status === 'completed'
      );

      if (completedReviews.length > 0) {
        const totalDays = completedReviews.reduce((acc, manuscript) => {
          const reviewerData = manuscript.reviewers.find(r => r.reviewer.toString() === userId.toString());
          if (reviewerData && reviewerData.completedAt) {
            const days = Math.ceil((reviewerData.completedAt - reviewerData.assignedAt) / (1000 * 60 * 60 * 24));
            return acc + days;
          }
          return acc;
        }, 0);
        stats.avgReviewTime = Math.round((totalDays / completedReviews.length) * 10) / 10;
      }

      // Calculate quality rating based on reputation
      stats.qualityRating = Math.min(5, (stats.reputation / 200) + 3); // Scale reputation to 1-5 rating

      // Get recent activity
      stats.recentActivity = reviewerManuscripts.slice(0, 5).map(manuscript => ({
        type: "review",
        title: manuscript.title,
        status: manuscript.reviewers.find(r => r.reviewer.toString() === userId.toString())?.status || 'assigned',
        date: new Date(manuscript.submittedAt).toLocaleDateString()
      }));

    } else if (user.role === 'author') {
      // Get author-specific stats
      const authorManuscripts = await Manuscript.find({
        author: userId
      }).populate('reviewers.reviewer', 'name email reputation');

      stats.totalReviews = authorManuscripts.length;
      stats.activeReviews = authorManuscripts.filter(m => m.status === 'under_review').length;

      // Get recent activity
      stats.recentActivity = authorManuscripts.slice(0, 5).map(manuscript => ({
        type: "submission",
        title: manuscript.title,
        status: manuscript.status,
        date: new Date(manuscript.submittedAt).toLocaleDateString()
      }));
    }

    // Get network peers count
    const totalReviewers = await User.countDocuments({ role: 'reviewer' });
    const totalAuthors = await User.countDocuments({ role: 'author' });
    stats.networkPeers = totalReviewers + totalAuthors;

    // Calculate rank based on reputation
    const reputationRank = stats.reputation >= 800 ? 'Expert' : 
                          stats.reputation >= 600 ? 'Advanced' : 
                          stats.reputation >= 400 ? 'Intermediate' : 
                          stats.reputation >= 200 ? 'Beginner' : 'Novice';

    // Generate expertise areas based on review history (simplified)
    const expertiseAreas = [];
    if (stats.totalReviews > 0) {
      // This could be enhanced to analyze actual manuscript categories
      if (stats.reputation >= 600) {
        expertiseAreas.push('Machine Learning', 'Neural Networks', 'Computer Vision');
      } else if (stats.reputation >= 400) {
        expertiseAreas.push('Data Science', 'Artificial Intelligence');
      } else if (stats.reputation >= 200) {
        expertiseAreas.push('General Research');
      } else {
        expertiseAreas.push('Learning');
      }
    }
    stats.expertise = expertiseAreas;

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        rank: reputationRank,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error("Error in getUserDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error in getUserDashboardStats",
      error: error.message
    });
  }
};

export {upload};