const express = require("express");
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const bookController = require('../controllers/bookController');

router.get("/search", protect, bookController.searchBooks);

router.get("/work/:workKey", protect, bookController.getBookWork);

router.get("/work/:workKey/editions", protect, bookController.getBookEditions);

router.post("/existing-works", protect, bookController.checkExistingWorks);

router.get("/catalog", protect, bookController.getLocalCatalog);

router.get("/languages", protect, bookController.getLanguages);

router.get("/subjects", protect, bookController.getSubjects);

router.delete("/delete/:id", protect, bookController.deleteBook);

router.get("/authors", protect, bookController.getAuthors);
router.post("/author/:id", protect, bookController.updateAuthor);


router.post("/publishYear/:id", protect, bookController.updatePublishYear);

// Review routes
router.get("/:bookId/review", protect, bookController.getReview);
router.post("/:bookId/review", protect, bookController.createReview);
router.patch("/:bookId/review", protect, bookController.updateReview);


module.exports = router;