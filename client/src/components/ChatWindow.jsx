import { useState, useEffect, useRef } from "react";

import { socket } from "../socket";

import { createDM } from "../api/conversation.api";

function ChatWindow({

    currentUser,

    selectedChat,

    setSelectedChat,

    messages,

    openProfileModal

}) {

    const [message, setMessage] =
        useState("");

    /*
    AUTO SCROLL TARGET
    */

    const messagesEndRef =
        useRef(null);

    /*
    AUTO SCROLL
    */

    const previousMessagesLength =
        useRef(0);

    useEffect(() => {

        /*
        FIRST LOAD / CHAT SWITCH
        */

        if (
            previousMessagesLength.current === 0
        ) {

            messagesEndRef.current?.scrollIntoView({

                behavior: "instant"

            });

        }

        /*
        NEW MESSAGE
        */

        else if (
            messages.length >
            previousMessagesLength.current
        ) {

            messagesEndRef.current?.scrollIntoView({

                behavior: "smooth"

            });

        }

        previousMessagesLength.current =
            messages.length;

    }, [messages]);

    /*
    NO CHAT SELECTED
    */

    if (!selectedChat) {

        return (

            <div className= "flex-1 bg-[#0b141a] flex items-center justify-center text-gray-400 text-xl" >

            Select a chat to start messaging

                </div>

        );

    }

    /*
    OTHER USER
    */

    const otherMember =
        selectedChat.members?.find(

            (member) =>

                member.id !==
                currentUser.id

        );

    /*
    DISPLAY DATA
    */

    const displayName =

        selectedChat.type === "ROOM"

            ? selectedChat.name

            : otherMember?.displayName;

    const avatar =

        selectedChat.type === "ROOM"

            ? "R"

            : "H";

    /*
    SEND MESSAGE
    */

    async function handleSendMessage() {

        if (!message.trim()) {

            return;

        }

        let conversationId =
            selectedChat.id;

        try {

            /*
            TEMPORARY CHAT
            */

            if (
                selectedChat.isTemporary
            ) {

                const conversation =
                    await createDM(
                        otherMember.id
                    );

                conversationId =
                    conversation.id;

                /*
                UPDATED CHAT
                */

                const updatedChat = {

                    ...selectedChat,

                    id: conversationId,

                    isTemporary: false

                };

                /*
                UPDATE STATE
                */

                setSelectedChat(
                    updatedChat
                );

                /*
                JOIN ROOM
                */

                socket.emit(

                    "conversation:join",

                    conversationId

                );

            }

            /*
            SEND REALTIME MESSAGE
            */

            socket.emit(

                "message:send",

                {

                    conversationId,

                    content: message

                },

                (response) => {

                    if (response.success) {

                        setMessage("");

                    } else {

                        //console.log(response.message);

                    }

                }

            );

        } catch (error) {

            console.log(error);

        }

    }

    return (

        <div className= "flex-1 flex flex-col bg-[#0b141a]" >

        {/* HEADER */ }

        < div className = "h-16 px-4 border-b border-gray-800 flex items-center justify-between bg-[#202c33]" >

            <div className="flex items-center gap-3" >

                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold" >

                    { avatar }

                    </div>

                    < div >

                    <h2 className="text-white font-semibold" >

                        { displayName }

                        </h2>

                        </div>

                        </div>

    {/* PROFILE BUTTON */ }

    <button
                    onClick={
        () => {

            if (
                selectedChat.type ===
                "ROOM"
            ) {

                openProfileModal(
                    selectedChat,
                    false
                );

            } else {

                openProfileModal(
                    otherMember,
                    false
                );

            }

        }
    }
    className = "text-white text-2xl px-3 py-1 hover:bg-[#2a3942] rounded-lg transition"
        >
                    ⋮
    </button>

        </div>

    {/* MESSAGES */ }

    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" >

    {
        messages.map((msg) => (

            <div
                        key= { msg.id }
                        className = {`max-w-[70%] px-4 py-2 rounded-xl text-white
                        ${msg.sender.id ===
                    currentUser.id

                    ? "bg-green-600 self-end"

                    : "bg-[#202c33] self-start"
                }`}
        >

        <p>
        { msg.content }
        </p>

        </div>

                ))
}

{/* AUTO SCROLL TARGET */ }

<div
                    ref={ messagesEndRef }
                />

    </div>

{/* INPUT */ }

<div className="p-4 border-t border-gray-800 flex gap-3 bg-[#202c33]" >

    <input

                    type="text"

value = { message }

onKeyDown = {(e) => {

    if (
        e.key === "Enter"
    ) {

        handleSendMessage();

    }

}}

onChange = {(e) =>

setMessage(
    e.target.value
)

                    }

placeholder = "Type a message"

className = "flex-1 bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"

    />

    <button

                    onClick={
    handleSendMessage
}

className = "bg-green-600 hover:bg-green-700 text-white px-5 rounded-lg transition"

    >

    Send

    </button>

    </div>

    </div>

    );

}

export default ChatWindow;