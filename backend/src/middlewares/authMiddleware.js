const jwt = require("../utils/jwt");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const { decode } = require("jsonwebtoken");

const protect = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
        return next(new AppError("Unauthorized", 401));

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verifyAccessToken(token);

        userModel.findById(decoded.id, (err, rows) => {

            if (err)
                return next(err);

            if (rows.length === 0)
                return next(new AppError("User not found", 404));

            const user = rows[0];
            delete user.password;
            req.user = user;

            next();

        });

    } catch(err) {

          next(new AppError("Invalid or expired token", 401));

    }

};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};