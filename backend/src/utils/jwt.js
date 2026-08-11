const jwt = require("jsonwebtoken");

const config = require("../config/config");


const generateAccessToken = (user) => {

    return jwt.sign(

        {
            id: user.id,
            email: user.email
        },

        config.jwt.accessTokenSecret,

        {
            expiresIn: config.jwt.accessTokenExpiry
        }

    );

};




const generateRefreshToken = (user) => {

    return jwt.sign(
        {
            id: user.id
        },

        config.jwt.refreshTokenSecret,
        {
            expiresIn: config.jwt.refreshTokenExpiry
        }

    );

};



const verifyAccessToken = (token) => {

    return jwt.verify(
        token,
        config.jwt.accessTokenSecret
    );

};



const verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        config.jwt.refreshTokenSecret
    );

};


module.exports = {

    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken

};