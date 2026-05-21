const prisma = require("../config/prisma");

async function findUserConversations(userId) {
    return prisma.conversation.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: {
            lastMessageAt: "desc",
        },
    });
}

async function findConversationIdsForUser(userId) {
    const memberships = await prisma.conversationMember.findMany({
        where: {
            userId,
        },
        select: {
            conversationId: true,
        },
    });

    return memberships.map((membership) => membership.conversationId);
}

async function findDMConversation(userAId, userBId) {
    const conversations = await prisma.conversation.findMany({
        where: {
            type: "DM",
            AND: [
                {
                    members: {
                        some: {
                            userId: userAId,
                        },
                    },
                },
                {
                    members: {
                        some: {
                            userId: userBId,
                        },
                    },
                },
            ],
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
    });

    return conversations.find((conversation) => conversation.members.length === 2);
}

async function createDMConversation(userAId, userBId) {
    return prisma.conversation.create({
        data: {
            type: "DM",
            lastMessageAt: new Date(),
            members: {
                create: [
                    {
                        userId: userAId,
                    },
                    {
                        userId: userBId,
                    },
                ],
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
    });
}

async function updateLastMessageAt(conversationId, time_instance = new Date()) {
    return prisma.conversation.update({
        where: {
            id: conversationId,
        },
        data: {
            lastMessageAt: time_instance,
        },
    });
}

async function updateLastSeenAt(
    conversationId,
    userId,
    time_instance = new Date()
) {
    return prisma.conversationMember.update({
        where: {
            userId_conversationId: {
                userId,
                conversationId,
            },
        },
        data: {
            lastSeenAt: time_instance,
        },
    });
}

module.exports = {
    findUserConversations,
    findConversationIdsForUser,
    findDMConversation,
    createDMConversation,
    updateLastMessageAt,
    updateLastSeenAt,
};