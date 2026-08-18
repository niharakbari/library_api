const db = require("../config/database");

const createLog = async (jobId, level, message, openLibraryKey = null) => {
    const [result] = await db.query(
        `INSERT INTO import_job_logs (import_job_id, level, message, open_library_key)
         VALUES (?, ?, ?, ?)`,
        [jobId, level, message, openLibraryKey]
    );
    return result.insertId;
};

const findByJobId = async (jobId) => {
    const [rows] = await db.query(
        `SELECT id, level, message, open_library_key, created_at 
         FROM import_job_logs 
         WHERE import_job_id = ? 
         ORDER BY created_at ASC`,
        [jobId]
    );
    return rows;
};

module.exports = {
    createLog,
    findByJobId,
};
