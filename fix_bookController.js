const fs = require('fs');
const file = 'backend/src/controllers/bookController.js';
let content = fs.readFileSync(file, 'utf8');

const newController = `
const clearLibrary = async (req, res, next) => {
    let connection;
    try {
        connection = await db.getConnection();
        
        // Check if library is already empty
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM books');
        if (countResult[0].total === 0) {
            connection.release();
            return res.status(200).json({
                success: true,
                message: "Library is already empty"
            });
        }

        await connection.beginTransaction();

        // Delete all mappings and reviews (cascade deletes)
        await connection.query('DELETE FROM book_authors');
        await connection.query('DELETE FROM book_languages');
        await connection.query('DELETE FROM book_reviews');
        await connection.query('DELETE FROM book_subjects');
        
        // Finally, delete all books
        await connection.query('DELETE FROM books');

        await connection.commit();

        const io = req.app.get('io');
        if (io) {
            io.emit('library_updated', { reason: 'library_cleared' });
        }

        return res.status(200).json({
            success: true,
            message: "Library cleared successfully"
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        return next(err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
`;

content = content.replace('module.exports = {', newController + '\\nmodule.exports = {\\n    clearLibrary,');

fs.writeFileSync(file, content, 'utf8');
console.log('Added clearLibrary to bookController.js');
