const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/me", authMiddleware, authController.getCurrentUser);

router.get("/search", authMiddleware, authController.searchUsers);

router.patch(
    "/profile",
    authMiddleware,
    upload.single("avatar"),
    authController.updateProfile
);

module.exports = router;