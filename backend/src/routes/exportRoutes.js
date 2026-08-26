const express = require('express');

const exportController = require('../controllers/exportController');

const router = express.Router();


router.get(
    '/books',
    exportController.exportBooks
);


router.get(
    '/authors',
    exportController.exportAuthors
);


router.get(
    '/subjects',
    exportController.exportSubjects
);


router.get(
    '/languages',
    exportController.exportLanguages
);


router.get(
    '/books/author/:authorId',
    exportController.exportBooksByAuthor
);


router.get(
    '/books/subject/:subjectId',
    exportController.exportBooksBySubject
);


module.exports = router;