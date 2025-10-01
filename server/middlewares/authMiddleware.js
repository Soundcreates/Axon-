import User from "../models/userModel.js";
import { getUser } from "../services/auth.js";

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
        // For API routes, always return JSON response
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Only redirect for non-API routes
        return res.redirect('/login?error=Unauthorized');
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

export { checkForAuthentication, restrictTo };