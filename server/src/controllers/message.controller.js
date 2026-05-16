const messageService =
    require("../services/message.service");

async function createMessage(
    req,
    res
) {

    try {

        const message =
            await messageService.createMessage(

                req.user.id,

                req.body.conversationId,

                req.body.content

            );

        return res.status(201).json({

            success: true,

            data: message

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

}

async function getMessages(
    req,
    res
) {

    try {

        const messages =
            await messageService.getConversationMessages(

                req.user.id,

                req.params.conversationId

            );

        return res.status(200).json({

            success: true,

            data: messages

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    createMessage,

    getMessages

};