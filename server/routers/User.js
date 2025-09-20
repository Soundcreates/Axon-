const express=require("express");
const  router=express.Router();  

const{handleUserSignup,handleUserLogin,handleUserLogout,handleWalletAuth,generateNonce}=require("../controllers/User.js");

router.post("/signup",handleUserSignup);
router.post("/login",handleUserLogin);
router.post("/logout",handleUserLogout);
router.get('/nonce', generateNonce);
router.post('/wallet-auth', handleWalletAuth);

module.exports=router;