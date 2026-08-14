const express = require('express');

const bookImportController = require ("../controllers/bookImportController")

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/batch", protect, bookImportController.importBatch);
router.post("/:workKey", protect, bookImportController.importBook);

router.get("/jobs", protect, bookImportController.getImportJobs);
router.get("/jobs/:jobId/logs", protect, bookImportController.getImportJobLogs);

module.exports =  router;
