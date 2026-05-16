const express =
    require("express");

const authMiddleware =
    require("../middleware/auth.middleware");

const messageController =
    require("../controllers/message.controller");

const router =
    express.Router();

router.get(
    "/:conversationId",
    authMiddleware,
    messageController.getMessages
);

router.post(
    "/",
    authMiddleware,
    messageController.createMessage
);

module.exports = router;