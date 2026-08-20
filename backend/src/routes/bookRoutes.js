const express = require("express");
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const bookController = require('../controllers/bookController');

router.get("/search",  bookController.searchBooks);

router.get("/work/:workKey",  bookController.getBookWork);

router.get("/work/:workKey/editions",  bookController.getBookEditions);

router.post("/existing-works", bookController.checkExistingWorks);

router.get("/catalog",  bookController.getLocalCatalog);

router.get("/languages",  bookController.getLanguages);

router.get("/subjects",  bookController.getSubjects);

router.get("/authors",  bookController.getAuthors);
router.post("/author", bookController.updateAuthor);


module.exports = router;