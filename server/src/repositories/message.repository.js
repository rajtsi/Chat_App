const prisma =
    require("../config/prisma");

async function createMessage(data) {

    return prisma.message.create({

        data,

        include: {

            sender: true

        }

    });

}

async function getConversationMessages(
    conversationId
) {

    return prisma.message.findMany({

        where: {
            conversationId
        },

        include: {
            sender: true
        },

        orderBy: {
            createdAt: "asc"
        }

    });

}

module.exports = {

    createMessage,

    getConversationMessages

};