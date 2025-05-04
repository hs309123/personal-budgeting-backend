const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync.utils");
const User = require("../models/user.model");
const { decryptText, encryptText } = require("../utils/encryptDecrypt.utils");
const ApiResponse = require("../utils/ApiResponse.utils");
const ApiError = require("../utils/ApiError.utils");
const { google } = require('googleapis');
const { sendEmail } = require("../services/mail.service");
const { OTPMail } = require("../MailTemplate/OTPMail");
const { PasswordChangeMail } = require("../MailTemplate/PasswordChangeMail");
const { WelcomeMail } = require("../MailTemplate/WelcomeMail");



class UserController {
    static signup = catchAsync(async (req, res) => {
        const { fullName, email, password } = req.body;

        // Validate input
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(new ApiError(400, "Cannot Create this User.", ["User Already Exists"]))
        }

        // Hash the password
        const hashedPassword = encryptText(password)

        // Create a new user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword
        });


        // Generate a JWT
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_KEY, {
            expiresIn: "15d",
        })

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_KEY, {
            expiresIn: "1d",
        })

        await sendEmail({ toMail: email, subject: "Welcome to Vaaidhya Healthcare", emailHtml: WelcomeMail(fullName) })

        res.cookie("_PBA_ID", refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        })

        res.status(201).json(new ApiResponse(201, { token: accessToken }, "User created successfully."))
    });

    static login = catchAsync(async (req, res) => {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json(new ApiError(400, "Email and Password are required", ["Email and Password are required"]));
        }

        // Find the user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json(new ApiError(404, "User Not Found", ["User not found"]));
        }

        const decryptedPassword = decryptText(user.password)

        // Check the password
        const isPasswordValid = decryptedPassword === password
        if (!isPasswordValid) {
            return res.status(401).json(new ApiError(404, "Invalid Credentials", ["Invalid Credentials"]));
        }

        // Generate a JWT
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_KEY, {
            expiresIn: "15d",
        })

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_KEY, {
            expiresIn: "1d",
        })

        res.cookie("_PBA_ID", refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        })

        res.status(200).json(new ApiResponse(200, { token: accessToken }, "Login successful."))
    });

    static logout = catchAsync(async (req, res) => {
        res.clearCookie("_PBA_ID", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json(new ApiResponse(200, null, "Logout successful."));
    })

    static googleAuth = catchAsync(async (req, res) => {
        const code = req.query.code
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const FRONTEND_URL = process.env.FRONTEND_URL

        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            FRONTEND_URL
        )

        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await (await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)).json()

        if (!userRes) {
            return res.status(400).json(new ApiError(400, "Invalid Login"))
        }

        const { email, name, picture } = userRes;

        let userObj = await User.findOne({ email })

        if (!userObj) {
            userObj = await User.create({
                image: picture,
                name,
                email,
                signupMethod: "google"
            })
            await sendEmail({ toMail: email, subject: "Welcome to ZealYug", emailHtml: WelcomeMail(name) })
        }

        const refreshToken = jwt.sign({ id: userObj._id }, process.env.JWT_REFRESH_TOKEN_KEY, {
            expiresIn: "15d",
        })

        const accessToken = jwt.sign({ id: userObj._id }, process.env.JWT_ACCESS_TOKEN_KEY, {
            expiresIn: "1d",
        })

        res.cookie("_PBA_ID", refreshToken, {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        })

        res.status(200).json(new ApiResponse(200, { token: accessToken }, "Login successful."))
    })

    static getUser = catchAsync(async (req, res) => {
        const user = req.user
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_KEY, {
            expiresIn: "1d",
        })
        if (user) {
            return res.status(200).json(new ApiResponse(200, { token: accessToken, user }, "User Fetched Successfully"))
        }
        else {
            return res.status(403).json(new ApiError(403, "Unauthorized Request"))
        }
    })

    static sendMailOtp = catchAsync(async (req, res) => {
        const email = req.body.email
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json(new ApiError(404, "This Email is not registered with us!"))
        }

        // 6 digit OTP
        const OTP = Math.floor(100000 + Math.random() * 900000);

        const accessToken = jwt.sign({ email, OTP: encryptText(`${OTP}`) }, process.env.JWT_OTP_TOKEN_KEY, {
            expiresIn: "5m",
        })


        const subject = "Verify your Email"
        await sendEmail({ toMail: email, subject, emailHtml: OTPMail(OTP) })
        res.cookie("_PBA_ID", accessToken, {
            maxAge: 5 * 60 * 1000, // 5 min
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        })

        return res.status(200).json(new ApiResponse(200, null, "OTP Sent Successfully"))

    })

    static verifyEmail = catchAsync(async (req, res) => {
        const token = req.cookies["_PBA_ID"];
        const otp = req.body.otp

        if (!token) {
            return res.status(403).json(new ApiError(403, "Unauthorized Access", ["UnAuthorized Access"]))
        }

        jwt.verify(token, process.env.JWT_OTP_TOKEN_KEY, (err, decodedVal) => {
            if (err) {
                return res.status(403).json(new ApiError(403, "Expired Session", ["Expired Session"]))
            }
            let OTP = decryptText(decodedVal.OTP)

            if (OTP === otp) {
                const accessToken = jwt.sign({ email: decodedVal.email }, process.env.JWT_OTP_TOKEN_KEY, {
                    expiresIn: "5m",
                })

                res.cookie("_PBA_ID", accessToken, {
                    maxAge: 5 * 60 * 1000, // 5 min
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "none"
                })

                return res.status(200).json(new ApiResponse(200, null, "OTP Verified Successfully"))
            }
            else {
                return res.status(400).json(new ApiError(400, "Invalid OTP", ["Invalid OTP"]))
            }


        })

    })

    static setPassword = catchAsync(async (req, res) => {

        const token = req.cookies["_PBA_ID"];
        const password = req.body.password

        if (!password) {
            return res.status(404).json(new ApiError(404, "Password is Required", ["Password is Required"]))
        }

        jwt.verify(token, process.env.JWT_OTP_TOKEN_KEY, async (err, decodedVal) => {
            if (err) {
                return res.status(403).json(new ApiError(403, "Expired Session", ["Expired Session"]))
            }

            const email = decodedVal.email
            // Hash the password
            const hashedPassword = encryptText(password)
            try {
                await User.findOneAndUpdate({ email }, { password: hashedPassword })
                const emailHtml = PasswordChangeMail()
                await sendEmail({ toMail: email, subject: "Password Changed Successfully", emailHtml })
                return res.status(200).json(new ApiResponse(200, null, "Password Changed Successfully"))
            } catch (error) {
                return res.status(500).json(new ApiError(500, "Cannot Update Now. Try Again after some time", ["Cannot Update Now. Try Again after some time"]))
            }
        })


    })
}

module.exports = UserController;