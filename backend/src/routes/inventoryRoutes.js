const express = require('express');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');

router.get("/author", inventoryController.searchAuthor );
router.get("/language", inventoryController.searchLanguage );
router.get("/title", inventoryController.searchTitle );


module.exports = router;