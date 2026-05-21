const jwt = require("jsonwebtoken");
const conversationRepo = require("../repositories/conversation.repository");
const messageService = require("../services/message.service");

const onlineUsers = {};

function initializeSocket(io) {
    /* SOCKET AUTH */
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Unauthorized"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error(error.message, "Invalid token"));
        }
    });

    /* CONNECTION LIFECYCLE MANAGEMENT */
    io.on("connection", async (socket) => {
        console.log("Authenticated socket:", socket.user.username);
        onlineUsers[socket.user.id] = true;
        io.emit("presence:update", onlineUsers);

        /* JOIN ALL EXISTING CONVERSATIONS */
        const conversationIds = await conversationRepo.findConversationIdsForUser(
            socket.user.id
        );
        for (const conversationId of conversationIds) {
            socket.join(conversationId);
        }
        console.log(
            `${socket.user.username} joined ${conversationIds.length} conversations`
        );

        /* JOIN SINGLE CONVERSATION SCOPE */
        socket.on("conversation:join", (conversationId) => {
            if (!conversationId) return;
            socket.join(conversationId);
            console.log(
                `${socket.user.username} joined conversation ${conversationId}`
            );
        });

        /* SEND REALTIME CHAT MESSAGE MODULE */
        socket.on("message:send", async (data, callback) => {
            try {
                const message = await messageService.createMessage(
                    socket.user.id,
                    data.conversationId,
                    data.content
                );
                const now = new Date();
                await conversationRepo.updateLastMessageAt(data.conversationId, now);
                await conversationRepo.updateLastSeenAt(
                    data.conversationId,
                    socket.user.id,
                    now
                );
                io.to(data.conversationId).emit("message:new", message);
                callback({ success: true });
            } catch (error) {
                callback({ success: false, message: error.message });
            }
        });

        socket.on("message:seen", async (conversationId) => {
            await messageService.markMessagesAsSeen(conversationId, socket.user.id);
            await conversationRepo.updateLastSeenAt(conversationId, socket.user.id);
            console.log(
                `${socket.user.username} marked messages as seen in conversation ${conversationId}`
            );
            io.to(conversationId).emit("message:seen", { conversationId });
        });

        /* WEBRTC ROUTING HANDSHAKES */
        socket.on("webrtc:offer", ({ offer, conversationId }) => {
            socket.to(conversationId).emit("webrtc:offer", {
                offer,
                conversationId,
                senderId: socket.user.id,
            });
        });

        socket.on("webrtc:answer", ({ answer, conversationId }) => {
            socket.to(conversationId).emit("webrtc:answer", {
                answer,
                conversationId, // Passing conversationId to ensure room match
                senderId: socket.user.id,
            });
        });

        socket.on("webrtc:ice-candidate", ({ candidate, conversationId }) => {
            socket.to(conversationId).emit("webrtc:ice-candidate", {
                candidate,
                conversationId,
                senderId: socket.user.id,
            });
        });

        socket.on("webrtc:call-ended", ({ conversationId }) => {
            socket.to(conversationId).emit("webrtc:call-ended", {
                conversationId, // Explicitly pass the room ID back to prevent global tearing
                senderId: socket.user.id,
            });
        });

        /* WEBRTC TARGETED BUSY REJECTION SIGNAL */
        socket.on("webrtc:busy-signal", ({ conversationId }) => {
            socket.to(conversationId).emit("webrtc:busy-signal", {
                conversationId, // Fixed payload scope binding
                senderId: socket.user.id,
            });
        });

        /* DISCONNECT LIFECYCLE MANAGEMENT */
        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.user.username);
            delete onlineUsers[socket.user.id];
            io.emit("presence:update", onlineUsers);
        });
    });
}

module.exports = initializeSocket;