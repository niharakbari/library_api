require("dotenv").config();


const accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_TOKEN_SECRET;
const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || process.env.JWT_ACCESS_TOKEN_EXPIRY;
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || process.env.JWT_REFRESH_TOKEN_EXPIRY;

const openLibraryBaseURL = process.env.OPEN_LIBRARY_BASE_URL


const bcryptSaltRounds = process.env.bcryptSaltRounds || process.env.BCRYPT_SALT_ROUNDS;


const missingVariables = [];


module.exports = {

    port : process.env.PORT,

    database : {
        name : process.env.DB_NAME,
        host : process.env.DB_HOST,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
    },

    jwt: {
        accessTokenSecret,
        refreshTokenSecret,
        accessTokenExpiry,
        refreshTokenExpiry,
        refreshTokenExpiryMs: 30 * 24 * 60 * 60 * 1000 // 30 days
    },

    bcryptSaltRounds : Number(bcryptSaltRounds),

    openLibraryURL : openLibraryBaseURL

}