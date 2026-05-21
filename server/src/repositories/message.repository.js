const prisma = require("../config/prisma");

async function createMessage(data) {
    return prisma.message.create({
        data,
        include: {
            sender: true,
        },
    });
}

async function getConversationMessages(conversationId) {
    return prisma.message.findMany({
        where: {
            conversationId,
        },
        include: {
            sender: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

async function markMessagesAsSeen(conversationId, currentUserId) {
    return prisma.message.updateMany({
        where: {
            conversationId,
            senderId: {
                not: currentUserId,
            },
            seenAt: null,
        },
        data: {
            seenAt: new Date(),
        },
    });
}

module.exports = {
    createMessage,
    getConversationMessages,
    markMessagesAsSeen,
};