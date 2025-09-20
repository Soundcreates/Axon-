const User=require("../models/userModel.js")
const {getUser}=require("../services/auth")


const checkForAuthentication = (req, res, next) => {
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers["authorization"];
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split("Bearer ")[1];
        }
    }

    const user = getUser(token);

    if (!user) {
        if (req.accepts('html')) {
            return res.redirect('/login?error=Unauthorized');
        }
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
};

const restrictTo=(roles=[])=>{
    return (req,res,next)=>{
        if(!req.user) return res.json({message:"Unauthorized"}).status(401);
        if(!roles.includes(req.user.role)) return res.json({message:"Unauthorized"}).status(401);
        next();
    }
}

module.exports={checkForAuthentication,restrictTo};