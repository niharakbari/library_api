const reportController = require('../controllers/reportController');

const express = require('express');


const router = express.Router();

router.get("/report", reportController.getReport );

module.exports = router ;