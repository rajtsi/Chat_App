import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ProfileModal from "../components/ProfileModal";

import { useAuth } from "../context/AuthContext";

import { getConversations, } from "../api/conversation.api";

import { getMessages } from "../api/message.api";

import { socket } from "../socket";

function ChatPage() {

    const { user } = useAuth();

    const [search, setSearch] = useState("");

    const [profileUser, setProfileUser] = useState(null);

    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [conversations, setConversations] = useState([]);

    const [selectedChat, setSelectedChat] = useState(null);

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});

    async function loadConversations() {

        try {

            const conversations =
                await getConversations();

            setConversations(conversations);

        } catch (error) {

            console.log(error);

        }

    }

    async function loadMessages(conversationId) {

        try {

            const messages =
                await getMessages(conversationId);

            setMessages(messages);

        } catch (error) {

            console.log(error);

        }

    }

    async function handleCreateDM(selectedUser) {

        try {

            /*
            CHECK IF CHAT ALREADY EXISTS
            */

            const existingChat =
                conversations.find((chat) => {

                    if (
                        chat.type !== "DM"
                    ) {

                        return false;

                    }

                    const otherMember =
                        chat.members?.find(
                            (member) =>
                                member.id !== user.id
                        );

                    return (
                        otherMember?.id ===
                        selectedUser.id
                    );

                });

            /*
            OPEN EXISTING CHAT
            */

            if (existingChat) {

                setSelectedChat(
                    existingChat
                );

                setSearch("");

                return;

            }

            /*
            CREATE TEMPORARY CHAT
            */

            const temporaryChat = {

                id: null,

                type: "DM",

                isTemporary: true,

                members: [
                    user,
                    selectedUser
                ]

            };

            setSelectedChat(
                temporaryChat
            );

            setMessages([]);

            setSearch("");

        } catch (error) {

            console.log(error);

        }

    }

    useEffect(() => {

        loadConversations();

    }, []);



    useEffect(() => {

        socket.on(

            "presence:update",

            (users) => {

                setOnlineUsers(
                    users
                );

            }

        );

        return () => {

            socket.off(
                "presence:update"
            );

        };

    }, []);

    /*
    LOAD MESSAGES
    */

    useEffect(() => {

        if (!selectedChat) {

            setMessages([]);

            return;

        }

        /*
        TEMPORARY CHAT
        */

        if (
            selectedChat.isTemporary
        ) {

            setMessages([]);

            return;

        }

        loadMessages(
            selectedChat.id
        );

    }, [selectedChat?.id]);

    /*
    JOIN SOCKET ROOM
    */

    useEffect(() => {

        if (
            selectedChat?.id &&
            !selectedChat.isTemporary
        ) {

            socket.emit(
                "conversation:join",
                selectedChat.id
            );

        }

    }, [selectedChat?.id]);

    /*
    RECEIVE REALTIME MESSAGE
    */

    useEffect(() => {

        function handleNewMessage(
            message
        ) {

            if (
                message.conversationId ===
                selectedChat?.id
            ) {

                setMessages((prev) => [

                    ...prev,

                    message

                ]);

            }

        }

        socket.on(
            "message:new",
            handleNewMessage
        );

        return () => {

            socket.off(
                "message:new",
                handleNewMessage
            );

        };

    }, [selectedChat?.id]);





    function openProfileModal(
        user,
        own = false
    ) {

        setProfileUser(user);

        setIsOwnProfile(own);

    }

    return (
        <div className="h-screen flex bg-[#111b21]">

            <Sidebar
                currentUser={user}
                chats={conversations}
                search={search}
                setSearch={setSearch}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                openProfileModal={openProfileModal}
                handleCreateDM={handleCreateDM}
                onlineUsers={onlineUsers}
            />

            <ChatWindow
                currentUser={user}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                messages={messages}
                setMessages={setMessages}
                openProfileModal={openProfileModal}
            />

            {profileUser && (

                <ProfileModal
                    isOnline={!!onlineUsers[profileUser?.id]}
                    isOpen={!!profileUser}
                    user={profileUser}
                    isOwnProfile={isOwnProfile}
                    onClose={() =>
                        setProfileUser(null)
                    }
                />

            )}

        </div>
    );
}

export default ChatPage;