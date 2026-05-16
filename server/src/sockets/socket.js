const jwt = require("jsonwebtoken");
const conversationRepo = require("../repositories/conversation.repository");
const messageService = require("../services/message.service");


const onlineUsers = {};

function initializeSocket(io) {

    /*
    SOCKET AUTH
    */

    io.use(async (socket, next) => {

        try {

            const token =
                socket.handshake.auth.token;

            if (!token) {

                return next(
                    new Error("Unauthorized")
                );

            }

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            socket.user = decoded;

            next();

        } catch (error) {

            next(
                new Error(error.message, "Invalid token")
            );

        }

    });

    /*
    CONNECTION
    */

    io.on("connection", async (socket) => {

        console.log(
            "Authenticated socket:",
            socket.user.username
        );

        onlineUsers[
            socket.user.id
        ] = true;

        io.emit(
            "presence:update",
            onlineUsers
        );

        /*
        JOIN ALL EXISTING CONVERSATIONS
        */

        const conversationIds =
            await conversationRepo.findConversationIdsForUser(
                socket.user.id
            );

        for (const conversationId of conversationIds) {
            socket.join(
                conversationId
            );

        }

        console.log(
            `${socket.user.username} joined ${conversationIds.length} conversations`
        );

        /*
        JOIN NEW CONVERSATION
        */

        socket.on(
            "conversation:join",
            (conversationId) => {

                /*
                PREVENT NULL ROOM
                */

                if (!conversationId) {

                    return;

                }

                socket.join(
                    conversationId
                );

                console.log(
                    `${socket.user.username} joined conversation ${conversationId}`
                );

            }
        );

        /*
        SEND MESSAGE
        */

        socket.on(
            "message:send",

            async (
                data,
                callback
            ) => {

                try {

                    const message =
                        await messageService.createMessage(

                            socket.user.id,

                            data.conversationId,

                            data.content

                        );

                    /*
                    EMIT TO ENTIRE ROOM
                    */

                    io.to(
                        data.conversationId
                    ).emit(
                        "message:new",
                        message
                    );

                    callback({

                        success: true

                    });

                } catch (error) {

                    callback({

                        success: false,

                        message:
                            error.message

                    });

                }

            }
        );

        /*
        DISCONNECT
        */

        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Disconnected:",
                    socket.user.username
                );

                delete onlineUsers[
                    socket.user.id
                ];

                io.emit(
                    "presence:update",
                    onlineUsers
                );

            }
        );

    }
    );

}

module.exports =
    initializeSocket;