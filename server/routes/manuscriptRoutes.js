import express from "express";
import { checkForAuthentication } from "../middlewares/authMiddleware.js"; 
import { getManuscripts, submitManuscript } from "../controllers/manuscriptController.js"; 

const manuscriptRouter = express.Router(); //  Fixed: Router() not router() (remember this)

//  Fixed route path to match frontend call (caught this sneaky error)
manuscriptRouter.post('/submit', checkForAuthentication, submitManuscript);

manuscriptRouter.get('/getManuscripts', checkForAuthentication, getManuscripts);

export default manuscriptRouter;