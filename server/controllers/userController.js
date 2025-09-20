const express = require('express');
const User = require('../models/userModel.js');

module.exports.getUserProfile = async (req,res) => {
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