const db = require("../config/database");

const create = async (userId, queryText, totalRecords) => {
    const [result] = await db.query(
        `INSERT INTO import_jobs (user_id, status, query_text, total_records)
         VALUES (?, 'pending', ?, ?)`,
        [userId, queryText, totalRecords]
    );
    return result.insertId;
};

const updateStatus = async (jobId, status) => {
    const query = status === 'running' 
        ? `UPDATE import_jobs SET status = ?, started_at = CURRENT_TIMESTAMP WHERE id = ?`
        : `UPDATE import_jobs SET status = ? WHERE id = ?`;
    
    await db.query(query, [status, jobId]);
};

const incrementCounters = async (jobId, { processed = 0, successful = 0, updated = 0, duplicate = 0, failed = 0 }) => {
    await db.query(
        `UPDATE import_jobs 
         SET processed_records = processed_records + ?,
             successful_records = successful_records + ?,
             updated_records = updated_records + ?,
             duplicate_records = duplicate_records + ?,
             failed_records = failed_records + ?
         WHERE id = ?`,
        [processed, successful, updated, duplicate, failed, jobId]
    );
};

const markCompleted = async (jobId, status) => {
    await db.query(
        `UPDATE import_jobs 
         SET status = ?, completed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, jobId]
    );
};

const findAll = async (limit = 50, offset = 0) => {
    const [rows] = await db.query(
        `SELECT id, user_id, status, query_text, total_records, processed_records, successful_records, duplicate_records, failed_records, started_at, completed_at, created_at 
         FROM import_jobs 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM import_jobs`);
    
    return {
        jobs: rows,
        total: countRows[0].total
    };
};

const findById = async (jobId) => {
    const [rows] = await db.query(
        `SELECT id, user_id, status, query_text, total_records, processed_records, successful_records, duplicate_records, failed_records, started_at, completed_at, created_at 
         FROM import_jobs 
         WHERE id = ?`,
        [jobId]
    );
    return rows[0] || null;
};

module.exports = {
    create,
    updateStatus,
    incrementCounters,
    markCompleted,
    findAll,
    findById,
};
