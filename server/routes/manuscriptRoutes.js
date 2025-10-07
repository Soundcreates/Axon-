import express from "express";
import { checkForAuthentication } from "../middlewares/authMiddleware.js"; 
import { getManuscripts, submitManuscript, getManuscriptDetails, markReviewComplete, finalizeManuscriptReview, fetchManuscriptDocument } from "../controllers/manuscriptController.js"; 

const manuscriptRouter = express.Router(); //  Fixed: Router() not router() (remember this)

//  Fixed route path to match frontend call (caught this sneaky error)
manuscriptRouter.post('/submit', checkForAuthentication, submitManuscript);

manuscriptRouter.get('/getManuscripts', checkForAuthentication, getManuscripts);
manuscriptRouter.get('/getManuscript/:manuscriptId', checkForAuthentication, getManuscriptDetails);
manuscriptRouter.get('/getDocument/:manuscriptId', checkForAuthentication, fetchManuscriptDocument);
manuscriptRouter.post('/markReviewComplete/:manuscriptId', checkForAuthentication, markReviewComplete);
manuscriptRouter.post('/finalizeReview/:manuscriptId', checkForAuthentication, finalizeManuscriptReview);

export default manuscriptRouter;