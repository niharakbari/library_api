const exportModel = require('../models/exportModel');



const escapeCSV = (value) => {                          

    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n') ||
        stringValue.includes('\r')
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;   // we replaced every " with "" coz csv doent allow " Harrt the "magecian" "..it accepts "Harry the ""magician"
    }

    return stringValue;
};


const rowsToCSV = (rows) => {

    if (!rows.length) {
        return '';
    }

    const headers = Object.keys(rows[0]);

    const csvRows = [
        headers.map(escapeCSV).join(',')       
    ];

    for (const row of rows) {
        csvRows.push(
            headers.map(header => escapeCSV(row[header])).join(',')
        );
    }

    return csvRows.join('\n');
};


const sendCSV = (res, rows, filename) => {

    const csv = rowsToCSV(rows);

    res.setHeader(
        'Content-Type',
        'text/csv; charset=utf-8'
    );

    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
    );

    return res.status(200).send(csv);
};


const exportBooks = async (req, res, next) => {

    try {

        const rows = await exportModel.getBooksForExport();

        return sendCSV(res, rows, 'books.csv');

    } catch (error) {
        next(error);
    }
};


const exportAuthors = async (req, res, next) => {

    try {

        const rows = await exportModel.getAuthorsForExport();

        return sendCSV(res, rows, 'authors.csv');

    } catch (error) {
        next(error);
    }
};


const exportSubjects = async (req, res, next) => {

    try {

        const rows = await exportModel.getSubjectsForExport();

        return sendCSV(res, rows, 'subjects.csv');

    } catch (error) {
        next(error);
    }
};


const exportLanguages = async (req, res, next) => {

    try {

        const rows = await exportModel.getLanguagesForExport();

        return sendCSV(res, rows, 'languages.csv');

    } catch (error) {
        next(error);
    }
};


const exportBooksByAuthor = async (req, res, next) => {

    try {

        const authorId = Number(req.params.authorId);

        if (!Number.isInteger(authorId) || authorId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid author ID'
            });
        }

        const rows =
            await exportModel.getBooksByAuthorForExport(authorId);

        return sendCSV(
            res,
            rows,
            `books-by-author-${authorId}.csv`
        );

    } catch (error) {
        next(error);
    }
};


const exportBooksBySubject = async (req, res, next) => {

    try {

        const subjectId = Number(req.params.subjectId);

        if (!Number.isInteger(subjectId) || subjectId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID'
            });
        }

        const rows =
            await exportModel.getBooksBySubjectForExport(subjectId);

        return sendCSV(
            res,
            rows,
            `books-by-subject-${subjectId}.csv`
        );

    } catch (error) {
        next(error);
    }
};


module.exports = {
    exportBooks,
    exportAuthors,
    exportSubjects,
    exportLanguages,
    exportBooksByAuthor,
    exportBooksBySubject
};