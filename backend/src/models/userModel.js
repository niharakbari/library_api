const db = require("../config/database");

const register = (user, callback) => {

    const sql = `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            role
        )
        VALUES (?, ?, ?, 'VIEWER')
    `;

    db.query(
        sql,
        [
            user.name,
            user.email,
            user.password_hash
        ],
        callback
    );

};

const updateRole = (id, newRole, callback) => {
    db.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [newRole, id],
        callback
    );
};

const findByEmail = (email, callback) => {

    db.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email],
        callback
    );

};

const findById = (id, callback) => {

    db.query(
        `
        SELECT
            id,
            name,
            email,
            password_hash,
            role,
            refresh_token_id,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id],
        callback
    );

};

const findAll = (filters, callback) => {
    let sql = `
        SELECT
            id,
            name,
            email,
            password_hash,
            role,
            created_at,
            updated_at
        FROM users
        WHERE 1=1
    `;
    const params = [];
    
    if (filters.role) {
        sql += " AND role = ?";
        params.push(filters.role);
    }
    
    if (filters.search) {
        sql += " AND (name LIKE ? OR email LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY id ASC";

    if (filters.limit && filters.offset !== undefined) {
        sql += " LIMIT ? OFFSET ?";
        params.push(parseInt(filters.limit), parseInt(filters.offset));
    }

    db.query(sql, params, callback);
};

const countAdmins = (callback) => {
    db.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'",
        [],
        (err, results) => {
            if (err) return callback(err);
            callback(null, results[0].count);
        }
    );
};

const deleteById = (id, callback) => {
    db.query("DELETE FROM users WHERE id = ?", [id], callback);
};

const updateRefreshTokenId = (userId, tokenId, callback) => {
    db.query("UPDATE users SET refresh_token_id = ? WHERE id = ?", [tokenId, userId], callback);
};

const findByRefreshTokenId = (tokenId, callback) => {
    db.query("SELECT * FROM users WHERE refresh_token_id = ? LIMIT 1", [tokenId], callback);
};

module.exports = {
    register,
    updateRole,
    findByEmail,
    findById,
    findAll,
    countAdmins,
    deleteById,
    updateRefreshTokenId,
    findByRefreshTokenId
};