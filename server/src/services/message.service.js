const prisma =
    require("../config/prisma");

const messageRepo =
    require("../repositories/message.repository");

async function validateMembership(
    conversationId,
    userId
) {

    const member =
        await prisma.conversationMember.findFirst({

            where: {

                conversationId,

                userId

            }

        });

    if (!member) {

        throw new Error(
            "Unauthorized conversation access"
        );

    }

}

function formatMessage(message) {

    return {

        id: message.id,
        conversationId:
            message.conversationId,
        content: message.content,

        createdAt: message.createdAt,

        sender: {

            id: message.sender.id,

            displayName:
                message.sender.displayName,

            username:
                message.sender.username,

            avatar:
                message.sender.avatar

        }

    };

}

async function createMessage(
    userId,
    conversationId,
    content
) {

    await validateMembership(
        conversationId,
        userId
    );

    const message =
        await messageRepo.createMessage({

            content,

            senderId: userId,

            conversationId

        });

    return formatMessage(message);

}

async function getConversationMessages(
    userId,
    conversationId
) {

    await validateMembership(
        conversationId,
        userId
    );

    const messages =
        await messageRepo.getConversationMessages(
            conversationId
        );

    return messages.map(
        formatMessage
    );

}

module.exports = {

    createMessage,

    getConversationMessages

};