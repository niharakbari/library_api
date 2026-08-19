const dataQualityController = require('../controllers/dataQualityController');

const express = require('express');

const router = express.Router();

router.get("/", dataQualityController.checkMissingFields);

module.exports = router ;