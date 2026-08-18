const express = require('express');

const bookImportController = require ("../controllers/bookImportController")

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/batch", protect, bookImportController.importBatch);
router.post("/selected", protect, bookImportController.importSelected);
router.post("/:workKey", protect, bookImportController.importBook);

router.get("/jobs", protect, bookImportController.getImportJobs);
router.get("/jobs/:jobId", protect, bookImportController.getImportJob);
router.get("/jobs/:jobId/logs", protect, bookImportController.getImportJobLogs);
router.get("/jobs/:jobId/items", protect, bookImportController.getImportJobItems);

module.exports =  router;
