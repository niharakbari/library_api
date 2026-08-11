const config = require("../config/config");


module.exports = {

    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "Strict",

    maxAge: config.jwt.refreshTokenExpiryMs

};