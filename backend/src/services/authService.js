const bcrypt = require("bcrypt");

const config = require("../config/config");

const userModel = require("../models/userModel");
const refreshTokenModel = require("../models/refreshTokenModel");

const jwt = require("../utils/jwt");

const AppError = require("../utils/AppError");




const loginUser = async (email, password) => {
    const rows = await userModel.findByEmail(email);

    if (rows.length === 0) {
        throw new AppError("Invalid email or password", 401);
    }

    const user = rows[0];

    if (!user.password_hash) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    const expiresAt = new Date(
        Date.now() + config.jwt.refreshTokenExpiryMs
    );

    if (user.refresh_token_id) {

        await refreshTokenModel.updateRefreshToken(
            user.refresh_token_id,
            refreshToken,
            expiresAt
        );

    } else {

        const result = await refreshTokenModel.saveRefreshToken(
            refreshToken,
            expiresAt
        );

        await userModel.updateRefreshTokenId(
            user.id,
            result.insertId
        );
    }

    return {
        accessToken,
        refreshToken,
        user
    };
};



const refreshToken = async (token) => {

    if (!token) {
        throw new AppError("Refresh token is required", 400);
    }

    try {
        jwt.verifyRefreshToken(token);
    } catch (err) {
        throw new AppError(
            "Invalid or expired refresh token",
            401
        );
    }

    const rows = await refreshTokenModel.findRefreshToken(token);

    if (rows.length === 0) {
        throw new AppError(
            "Invalid or expired refresh token",
            401
        );
    }

    const dbToken = rows[0];

    const now = new Date();

    if (new Date(dbToken.expires_at) < now) {
        await refreshTokenModel.deleteRefreshToken(dbToken.id);

        throw new AppError(
            "Refresh token expired",
            401
        );
    }

    const user = await userModel.findByRefreshTokenId(dbToken.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const newAccessToken = jwt.generateAccessToken(user);
    const newRefreshToken = jwt.generateRefreshToken(user);

    const expiresAt = new Date(
        Date.now() + config.jwt.refreshTokenExpiryMs
    );

    await refreshTokenModel.updateRefreshToken(
        dbToken.id,
        newRefreshToken,
        expiresAt
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user
    };
};


const logoutUser = async (token) => {

    if (!token) {
        return;
    }

    const rows = await refreshTokenModel.findRefreshToken(token);

    if (rows.length === 0) {
        return;
    }

    const dbToken = rows[0];

    const user = await userModel.findByRefreshTokenId(
        dbToken.id
    );

    if (user) {
        await userModel.updateRefreshTokenId(
            user.id,
            null
        );
    }

    await refreshTokenModel.deleteRefreshToken(
        dbToken.id
    );
};


module.exports = {
    loginUser,
    refreshToken,
    logoutUser
};