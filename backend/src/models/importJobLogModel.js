const db = require("../config/database");

const createLog = async (jobId, level, message, openLibraryKey = null) => {
    const [result] = await db.query(
        `INSERT INTO import_job_logs (import_job_id, level, message, open_library_key)
         VALUES (?, ?, ?, ?)`,
        [jobId, level, message, openLibraryKey]
    );
    return result.insertId;
};

module.exports = {
    createLog,
};
