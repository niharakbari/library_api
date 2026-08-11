const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
    loginValidation
} = require("../validations/authValidation");

const validationMiddleware = require("../middlewares/validationMiddleware");

router.post(
    "/login",
    loginValidation,
    validationMiddleware,
    authController.loginUser
);

const { protect } = require("../middlewares/authMiddleware");

router.get(
    "/me",
    protect,
    authController.getMe
);

router.post(
    "/refresh",
    authController.refreshToken
);

router.post(
    "/logout",
    authController.logoutUser
);

module.exports = router;