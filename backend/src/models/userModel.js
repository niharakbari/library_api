const db = require("../config/database");


// ---------- Register ----------

const register = async (user) => {
    const [result] = await db.query(
        `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
        
        )
        VALUES (?, ?, ?')
        `,
        [
            user.name,
            user.email,
            user.password_hash
        ]
    );

    return result;
};



// ---------- Find By Email ----------

const findByEmail = async (email) => {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    return rows;
};


// ---------- Find By ID ----------

const findById = async (id) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            refresh_token_id,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};




// ---------- Update User's Refresh Token ID ----------

const updateRefreshTokenId = async (userId, tokenId) => {
    const [result] = await db.query(
        "UPDATE users SET refresh_token_id = ? WHERE id = ?",
        [tokenId, userId]
    );

    return result;
};


// ---------- Find User By Refresh Token ID ----------

const findByRefreshTokenId = async (tokenId) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM users
        WHERE refresh_token_id = ?
        LIMIT 1
        `,
        [tokenId]
    );

    return rows[0] || null;
};


module.exports = {
    register,
    findByEmail,
    findById,
    updateRefreshTokenId,
    findByRefreshTokenId
};