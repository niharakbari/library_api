const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");
const refreshTokenModel = require("../models/refreshTokenModel");

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
            const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiryMs);

            if (user.refresh_token_id) {
                refreshTokenModel.updateRefreshToken(user.refresh_token_id, refreshToken, expiresAt, (updateErr) => {
                    if (updateErr) return reject(updateErr);
                    resolve({ accessToken, refreshToken, user });
                });
            } else {
                refreshTokenModel.saveRefreshToken(refreshToken, expiresAt, (saveErr, result) => {
                    if (saveErr) return reject(saveErr);
                    userModel.updateRefreshTokenId(user.id, result.insertId, (updateUserErr) => {
                        if (updateUserErr) return reject(updateUserErr);
                        resolve({ accessToken, refreshToken, user });
                    });
                });
            }
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

        refreshTokenModel.findRefreshToken(token, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) {
                return reject(new AppError("Invalid or expired refresh token", 401));
            }

            const dbToken = rows[0];
            const now = new Date();
            if (new Date(dbToken.expires_at) < now) {
                refreshTokenModel.deleteRefreshToken(dbToken.id, () => {});
                return reject(new AppError("Refresh token expired", 401));
            }

            userModel.findByRefreshTokenId(dbToken.id, (err, userRows) => {
                if (err) return reject(err);
                if (userRows.length === 0) {
                    return reject(new AppError("User not found", 404));
                }

                const user = userRows[0];
                const newAccessToken = jwt.generateAccessToken(user);
                const newRefreshToken = jwt.generateRefreshToken(user);
                const expiresAt = new Date(Date.now() + config.jwt.refreshTokenExpiryMs);

                refreshTokenModel.updateRefreshToken(dbToken.id, newRefreshToken, expiresAt, (updateErr) => {
                    if (updateErr) return reject(updateErr);
                    resolve({
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                        user
                    });
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
        refreshTokenModel.findRefreshToken(token, (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve();
            
            const dbToken = rows[0];
            
            userModel.findByRefreshTokenId(dbToken.id, (userErr, userRows) => {
                if (userErr) return reject(userErr);
                if (userRows.length > 0) {
                    userModel.updateRefreshTokenId(userRows[0].id, null, () => {
                        refreshTokenModel.deleteRefreshToken(dbToken.id, (delErr) => {
                            if (delErr) return reject(delErr);
                            resolve();
                        });
                    });
                } else {
                    refreshTokenModel.deleteRefreshToken(dbToken.id, (delErr) => {
                        if (delErr) return reject(delErr);
                        resolve();
                    });
                }
            });
        });
    });
};

module.exports = {

    loginUser,
    refreshToken,
    logoutUser
};
