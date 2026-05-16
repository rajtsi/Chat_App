const express =
    require("express");

const authMiddleware = require("../middleware/auth.middleware");

const conversationController =
    require("../controllers/conversation.controller");

const router =
    express.Router();

router.get(
    "/",
    authMiddleware,
    conversationController.getConversations
);
router.post(
    "/dm",
    authMiddleware,
    conversationController.createDMConversation
);

module.exports = router;