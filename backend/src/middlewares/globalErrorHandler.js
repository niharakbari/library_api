const logger = require("../config/logger");

const cookieOptions = require("../utils/cookieOptions");

const globalErrorHandler = (err, req, res, next) => {

    logger.error(err.message);

    if (err.message === "Refresh token expired") {
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("accessToken", cookieOptions);
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

};

module.exports = globalErrorHandler;