const db = require("../config/database");

const createItem = async (jobId, { workKey, title, languages, status, bookId = null, errorMessage = null }) => {
    const [result] = await db.query(
        `INSERT INTO import_job_items 
            (import_job_id, open_library_work_key, title, languages, status, book_id, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [jobId, workKey, title || null, languages ? JSON.stringify(languages) : null, status, bookId, errorMessage]
    );
    return result.insertId;
};

const updateItemStatus = async (itemId, { status, bookId = null, errorMessage = null, title = null }) => {
    await db.query(
        `UPDATE import_job_items 
         SET status = ?, 
             book_id = COALESCE(?, book_id), 
             error_message = COALESCE(?, error_message),
             title = COALESCE(?, title)
         WHERE id = ?`,
        [status, bookId, errorMessage, title, itemId]
    );
};

const findByJobId = async (jobId) => {
    const [rows] = await db.query(
        `SELECT id, import_job_id, open_library_work_key, title, languages, status, book_id, error_message, created_at, updated_at
         FROM import_job_items 
         WHERE import_job_id = ? 
         ORDER BY created_at ASC`,
        [jobId]
    );
    return rows;
};

module.exports = {
    createItem,
    updateItemStatus,
    findByJobId,
};
