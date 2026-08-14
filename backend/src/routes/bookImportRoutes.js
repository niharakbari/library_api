const express = require('express');

const bookImportController = require ("../controllers/bookImportController")

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/batch", protect, bookImportController.importBatch);
router.post("/:workKey", bookImportController.importBook);

module.exports =  router;
