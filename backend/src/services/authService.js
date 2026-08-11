const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");

const jwt = require("../utils/jwt");

const AppError = require("../utils/AppError");

const logger = require("../config/logger");




//        ----------login user--------------

const loginUser = async (email, password) => {
    return new Promise((resolve, reject) => {
        userModel.findByEmail(email, async (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return reject(new AppError("Invalid email or password", 401));

            const user = rows[0];

            if (!user.password_hash) {
                return reject(new AppError("Invalid email or password", 401));
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordMatch) return reject(new AppError("Invalid email or password", 401));

            const accessToken = jwt.generateAccessToken(user);
            const refreshToken = jwt.generateRefreshToken(user);

            userModel.updateRefreshToken(user.id, refreshToken, (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve({ accessToken, refreshToken, user });
            });
        });
    });
};

const refreshToken = async (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new AppError("Refresh token is required", 400));
        }

        let decoded;
        try {
            decoded = jwt.verifyRefreshToken(token);
        } catch (err) {
            return reject(new AppError("Invalid or expired refresh token", 401));
        }

        userModel.findByRefreshToken(token, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                return reject(new AppError("Invalid or expired refresh token", 401));
            }

            const user = rows[0];
            const newAccessToken = jwt.generateAccessToken(user);
            const newRefreshToken = jwt.generateRefreshToken(user);

            userModel.updateRefreshToken(user.id, newRefreshToken, (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    user
                });
            });
        });
    });
};

const logoutUser = async (token) => {
    return new Promise((resolve, reject) => {
        if (!token) {
            return resolve();
        }
        userModel.findByRefreshToken(token, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve();
            
            const user = rows[0];
            
            userModel.updateRefreshToken(user.id, null, (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve();
            });
        });
    });
};

module.exports = {

    loginUser,
    refreshToken,
    logoutUser
};
