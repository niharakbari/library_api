const express = require('express');

const bookImportController = require ("../controllers/bookImportController")

const router = express.Router();

router.post("/:workKey", bookImportController.importBook );

module.exports =  router;
