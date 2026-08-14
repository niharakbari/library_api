const jwt = require("../utils/jwt");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verifyAccessToken(token);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        req.user = user;

        next();
    } catch(err) {
        return next(new AppError("Unauthorized", 401));
    }
});

module.exports = {
    protect
};