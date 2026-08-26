const bookSubjectsModel = require('../models/bookSubjectsModel');
const bookAuthorModel = require('../models/bookAuthorModel');
const bookLanguageModel = require('../models/bookLanguageModel');
const bookModel = require('../models/bookModel');



const getReport = async (req, res, next) => {
    try {
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

        const rawAuthors = await bookAuthorModel.topAuthors(limit);
        const rawSubjects = await bookSubjectsModel.subjectWiseBooks(limit);
        const rawLanguages = await bookLanguageModel.topLanguages();
        const rawYears = await bookModel.booksByYear();

        // Map DB snake_case to frontend expected format
        const topAuthors = rawAuthors.map(a => ({ name: a.author_name, count: a.total_books }));
        const topSubjects = rawSubjects.map(s => ({ name: s.subject_name, count: s.total_books }));
        const topLanguages = rawLanguages.map(l => ({ name: l.language_code, count: l.total_books }));
        const booksByYear = rawYears.map(y => ({ name: y.publish_year?.toString() || 'Unknown', count: y.total_books }));

        return res.status(200).json({
            success: true,
            data: {
                topAuthors,
                topSubjects,
                topLanguages,
                booksByYear
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getReport
}