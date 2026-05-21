const express = require("express");
const cors = require("cors");
const conversationRoutes = require("./routes/conversation.routes");
const authRoutes = require("./routes/auth.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app;