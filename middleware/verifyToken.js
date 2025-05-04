const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError.utils');

const verifyToken = (req, res, next) => {
    const accessToken = req.headers["authorization"] || null
    const refreshToken = req.cookies["_PBA_ID"] || null
    if (!accessToken && !refreshToken) {
        return res.status(401).json(new ApiError(401, "Login Session Expired. Login Again"));
    }


    // Verify the access token
    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_KEY, async (err, decoded) => {
        if (err) {
            // If access token is expired or invalid
            if (err?.message && refreshToken) {
                // Verify the refresh token
                jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_KEY, async (refreshErr, refreshDecoded) => {
                    try {
                        if (refreshErr) {
                            return res.status(401).json(new ApiError(401, "Login Session expired."));
                        }

                        const userObj = await User.findById(refreshDecoded.id)

                        userObj.lastLogin = Date.now()
                        userObj.save()

                        // Add user info to the request object for further use
                        req.user = userObj;
                        next();
                    }

                    catch (error) {
                        console.log(error)
                        return res.status(401).json(new ApiError(401, "Login session is invalid or expired."))
                    }
                });
            } else {
                // No refresh token or other error
                return res.status(401).json(new ApiError(401, "Login session is invalid or expired."));
            }
        } else {
            try {
                // Access token is valid
                const userObj = await User.findById(decoded.id)

                userObj.lastLogin = Date.now()
                userObj.save()
                req.user = userObj
                next();
            } catch (error) {
                console.log(error)
                return res.status(401).json(new ApiError(401, "Login session is invalid or expired."));
            }

        }
    });
};

module.exports = verifyToken;
