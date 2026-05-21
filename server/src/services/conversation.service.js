const conversationRepo = require("../repositories/conversation.repository");

async function getUserConversations(userId) {
    const conversations = await conversationRepo.findUserConversations(userId);

    return conversations.map((conversation) => {
        /*
        CURRENT USER MEMBERSHIP
        */
        const currentMember = conversation.members.find(
            (member) => member.userId === userId
        );

        return {
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,
            createdAt: conversation.createdAt,
            lastMessageAt: conversation.lastMessageAt,

            /*
            PER USER CONVERSATION STATE
            */
            lastSeenAt: currentMember?.lastSeenAt || null,

            members: conversation.members.map((member) => ({
                id: member.user.id,
                displayName: member.user.displayName,
                username: member.user.username,
                avatar: member.user.avatar,
            })),
        };
    });
}

async function createDMConversation(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
        throw new Error("Cannot create chat with yourself");
    }

    const existingConversation = await conversationRepo.findDMConversation(
        currentUserId,
        targetUserId
    );

    if (existingConversation) {
        return existingConversation;
    }

    return conversationRepo.createDMConversation(currentUserId, targetUserId);
}

module.exports = {
    getUserConversations,
    createDMConversation,
};