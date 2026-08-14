const db = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res, next) => {
    
    // Run all counts concurrently
    const [
        booksCount,
        authorsCount,
        subjectsCount,
        languagesCount,
        jobsCount
    ] = await Promise.all([
        db.query(`SELECT COUNT(*) as total FROM books`),
        db.query(`SELECT COUNT(*) as total FROM authors`),
        db.query(`SELECT COUNT(*) as total FROM subjects`),
        db.query(`SELECT COUNT(*) as total FROM languages`),
        db.query(`SELECT status, COUNT(*) as count FROM import_jobs GROUP BY status`)
    ]);

    const totalBooks = booksCount[0][0].total;
    const totalAuthors = authorsCount[0][0].total;
    const totalSubjects = subjectsCount[0][0].total;
    const totalLanguages = languagesCount[0][0].total;

    // Process job stats
    const jobStats = {
        total: 0,
        running: 0,
        pending: 0,
        completed: 0,
        failed: 0
    };

    jobsCount[0].forEach(row => {
        jobStats.total += row.count;
        if (jobStats[row.status] !== undefined) {
            jobStats[row.status] = row.count;
        }
    });

    return res.status(200).json({
        success: true,
        data: {
            books: totalBooks,
            authors: totalAuthors,
            subjects: totalSubjects,
            languages: totalLanguages,
            jobs: jobStats
        }
    });
});

module.exports = {
    getDashboardStats
};
