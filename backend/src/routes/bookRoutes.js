const express = require("express");
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get("/search", bookController.searchBooks);

router.get("/work/:workKey", bookController.getBookWork);

router.get("/work/:workKey/editions", bookController.getBookEditions);

module.exports = router;