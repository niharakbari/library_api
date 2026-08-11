const db = require("../config/database");

const saveRefreshToken = (
    refreshToken,
    expiresAt,
    callback
) => {

    db.query(
        `
        INSERT INTO refresh_tokens
        (
            refresh_token,
            expires_at
        )
        VALUES (?, ?)
        `,
        [
            refreshToken,
            expiresAt
        ],
        callback
    );

};

const findRefreshToken = (refreshToken, callback) => {
    db.query("SELECT * FROM refresh_tokens WHERE refresh_token = ? LIMIT 1", [refreshToken], callback);
};

const deleteRefreshToken = (id, callback) => {
    db.query("DELETE FROM refresh_tokens WHERE id = ?", [id], callback);
};

const updateRefreshToken = (id, newToken, newExpiresAt, callback) => {
    db.query(
        "UPDATE refresh_tokens SET refresh_token = ?, expires_at = ? WHERE id = ?",
        [newToken, newExpiresAt, id],
        callback
    );
};

module.exports = {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    updateRefreshToken
};
