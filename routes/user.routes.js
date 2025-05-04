const { Router } = require('express');
const userController = require('../controllers/user.controller');
const verifyToken = require("../middleware/verifyToken");

const router = Router();



router.post("/login", userController.login)
router.post("/signup", userController.signup)
router.get("/auth/google", userController.googleAuth)

router.post("/send-mail-otp", userController.sendMailOtp)
router.post("/verify-email", userController.verifyEmail)
router.post("/set-password", userController.setPassword)

router.use(verifyToken)

router.post("/logout", userController.logout)
router.get("/", userController.getUser)



module.exports = router;