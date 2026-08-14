const db = require("../config/database");


const saveRefreshToken = async (refreshToken, expiresAt) => {
    const [result] = await db.query(
        `
        INSERT INTO refresh_tokens
        (
            refresh_token,
            expires_at
        )
        VALUES (?, ?)
        `,
        [refreshToken, expiresAt]
    );

    return result;
};


const findRefreshToken = async (refreshToken) => {
    const [rows] = await db.query(
        `
        SELECT *
        FROM refresh_tokens
        WHERE refresh_token = ?
        LIMIT 1
        `,
        [refreshToken]
    );

    return rows;
};


const deleteRefreshToken = async (id) => {
    const [result] = await db.query(
        `
        DELETE FROM refresh_tokens
        WHERE id = ?
        `,
        [id]
    );

    return result;
};


const updateRefreshToken = async (id, newToken, newExpiresAt) => {
    const [result] = await db.query(
        `
        UPDATE refresh_tokens
        SET refresh_token = ?, expires_at = ?
        WHERE id = ?
        `,
        [newToken, newExpiresAt, id]
    );

    return result;
};


module.exports = {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    updateRefreshToken
};