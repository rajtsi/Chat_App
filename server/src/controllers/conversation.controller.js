const conversationService =
    require("../services/conversation.service");

async function getConversations(
    req,
    res
) {

    try {

        const conversations =
            await conversationService.getUserConversations(
                req.user.id
            );

        return res.status(200).json({

            success: true,

            data: conversations

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}


async function createDMConversation(
    req,
    res
) {

    try {

        const conversation =
            await conversationService.createDMConversation(
                req.user.id,
                req.body.targetUserId
            );

        return res.status(201).json({

            success: true,

            data: conversation

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {
    getConversations,
    createDMConversation
};