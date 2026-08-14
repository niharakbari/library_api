const authService = require("../services/authService");

const cookieOptions = require("../utils/cookieOptions");

const logger = require("../config/logger");

const asyncHandler = require("../utils/asyncHandler");

const AppError = require("../utils/AppError");


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log("into loginuser before calling authservice");

    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

    logger.info(`User Logged In : ${email}`);

    // Set HttpOnly secure cookie for refresh token
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    });
});

const getMe = asyncHandler(async (req, res) => {
    // req.user is already populated by protect middleware
    const user = req.user;

    // The user's password is NOT explicitly removed here because the userModel 
    // SELECT query in protect middleware fetched the full row. So we manually construct the response.
    return res.status(200).json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    });
});

const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshToken(token);

    logger.info(`Token Refreshed for user ID : ${user.id}`);

    // Set new HttpOnly secure cookie
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken
    });
});

const logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    await authService.logoutUser(token);

    // Clear the cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
    });

    logger.info("User Logged Out");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

module.exports = {
    loginUser,
    getMe,
    refreshToken,
    logoutUser
};
