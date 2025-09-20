const mongoose = require("mongoose");

const UserSchema=new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique:true,
        },
        password:{
            type: String,
            required: true,
            
        },
        role:{
            type:String,
            enum:[""],
            required:true,
        },

        walletAddress: {
            type: String,
            unique: true,
            sparse: true // allows multiple null values
        },
        loginMethod: {
            type: String,
            enum: ['email', 'wallet'],
            default: 'email'
        }


    },
{timestamps: true });
    

const User=mongoose.model("User",UserSchema);
module.exports=User;