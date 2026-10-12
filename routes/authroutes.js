const express=require('express');
const router=express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const {sendVerification,verifyEmail,completeSignup,login,refreshAccesToken,logout,forgotPassword,resetPassword,changePassword} 
 = require("../controller/authcontroller");


router.post('/send-verification',sendVerification);
router.get('/verify-email',verifyEmail);
router.post("/complete-signup", completeSignup);
router.post("/login",login);
router.get("/logout", logout);
router.post("/change-password", authMiddleware, changePassword);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/refresh-token",refreshAccesToken);
router.get("/profile", authMiddleware, (req, res) => {
    res.send(`Welcome! Your user ID is ${req.user.userId}`);
});

module.exports=router;