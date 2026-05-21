import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ProfileModal from "../components/ProfileModal";
import VideoCall from "../components/VideoCall";

import { useAuth } from "../context/AuthContext";
import { getConversations } from "../api/conversation.api";
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

    /* GLOBAL CALL STATES */
    const [isVideoOverlayOpen, setIsVideoOverlayOpen] = useState(false);
    const [globalActiveRoomId, setGlobalActiveRoomId] = useState(null);
    const [incomingCallOffer, setIncomingCallOffer] = useState(null);

    async function loadConversations() {
        try {
            const conversations = await getConversations();
            setConversations(conversations);
        } catch (error) {
            console.log(error);
        }
    }

    async function loadMessages(conversationId) {
        try {
            const messages = await getMessages(conversationId);
            setMessages(messages);
        } catch (error) {
            console.log(error);
        }
    }

    async function handleCreateDM(selectedUser) {
        try {
            const existingChat = conversations.find((chat) => {
                if (chat.type !== "DM") return false;
                const otherMember = chat.members?.find(
                    (member) => member.id !== user.id
                );
                return otherMember?.id === selectedUser.id;
            });

            if (existingChat) {
                setSelectedChat(existingChat);
                setSearch("");
                return;
            }

            const temporaryChat = {
                id: null,
                type: "DM",
                isTemporary: true,
                members: [user, selectedUser],
            };

            setSelectedChat(temporaryChat);
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
        socket.on("presence:update", (users) => {
            setOnlineUsers(users);
        });
        return () => socket.off("presence:update");
    }, []);

    useEffect(() => {
        if (!selectedChat || selectedChat.isTemporary) {
            setMessages([]);
            return;
        }
        loadMessages(selectedChat.id);
    }, [selectedChat?.id]);

    useEffect(() => {
        if (selectedChat?.id && !selectedChat.isTemporary) {
            socket.emit("conversation:join", selectedChat.id);
        }
    }, [selectedChat?.id]);

    useEffect(() => {
        function handleNewMessage(message) {
            /*
            UPDATE CURRENT OPEN CHAT
            */

            if (message.conversationId === selectedChat?.id) {
                setMessages((prev) => [...prev, message]);

                /*
                MARK AS SEEN ONLY
                IF THIS CHAT IS OPEN
                */

                if (message.sender.id !== user.id) {
                    socket.emit("message:seen", selectedChat.id);
                }
            }

            /*
            UPDATE SIDEBAR CHAT STATE
            */

            setConversations((prev) => {
                const updated = [...prev];

                const index = updated.findIndex(
                    (chat) => chat.id === message.conversationId
                );

                if (index === -1) {
                    return prev;
                }

                const chat = updated[index];

                /*
                UPDATE LAST MESSAGE TIME
                */

                chat.lastMessageAt = message.createdAt;

                /*
                IF I SENT MESSAGE
                THEN I ALREADY SAW IT
                */

                if (message.sender.id === user.id) {
                    chat.lastSeenAt = message.createdAt;
                }

                /*
                MOVE CHAT TO TOP
                */

                updated.splice(index, 1);

                updated.unshift(chat);

                return [...updated];
            });
        }
        socket.on("message:new", handleNewMessage);
        return () => socket.off("message:new", handleNewMessage);
    }, [selectedChat?.id]);

    useEffect(() => {
        function handleMessageSeen({ conversationId }) {
            setConversations((prev) =>
                prev.map((chat) => {
                    if (chat.id !== conversationId) {
                        return chat;
                    }

                    return {
                        ...chat,

                        lastSeenAt: new Date().toISOString(),
                    };
                })
            );
        }

        socket.on("message:seen", handleMessageSeen);

        return () => {
            socket.off("message:seen", handleMessageSeen);
        };
    }, []);

    /* GLOBAL WEBRTC OFFER LISTENER WITH GATEKEEPER DEFENSE */
    useEffect(() => {
        function handleIncomingCall({ offer, conversationId, senderId }) {
            if (senderId === user.id) return;

            // GATEKEEPER VERIFICATION: If Bob is in Room A-B, drop Charlie's Room B-C call instantly
            if (isVideoOverlayOpen) {
                console.log(
                    `Sending busy-signal drop explicitly to incoming room scope: ${conversationId}`
                );
                socket.emit("webrtc:busy-signal", { conversationId });
                return;
            }

            console.log(`Global alert: Incoming call for room ${conversationId}`);
            setGlobalActiveRoomId(conversationId);
            setIncomingCallOffer(offer);
            setIsVideoOverlayOpen(true);
        }

        socket.on("webrtc:offer", handleIncomingCall);
        return () => socket.off("webrtc:offer", handleIncomingCall);
    }, [user.id, isVideoOverlayOpen]);

    function openProfileModal(user, own = false) {
        setProfileUser(user);
        setIsOwnProfile(own);
    }

    function startOutgoingCall(roomId) {
        setGlobalActiveRoomId(roomId);
        setIncomingCallOffer(null);
        setIsVideoOverlayOpen(true);
    }

    return (
        <div className="h-screen flex bg-[#111b21] relative overflow-hidden">
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
                onTriggerCall={startOutgoingCall}
            />

            {profileUser && (
                <ProfileModal
                    isOnline={!!onlineUsers[profileUser?.id]}
                    isOpen={!!profileUser}
                    user={profileUser}
                    isOwnProfile={isOwnProfile}
                    onClose={() => setProfileUser(null)}
                />
            )}

            {isVideoOverlayOpen && (
                <div className="absolute inset-0 z-50 bg-[#0b141a] bg-opacity-98 flex items-center justify-center">
                    <VideoCall
                        conversationId={globalActiveRoomId}
                        initialOffer={incomingCallOffer}
                        onCloseLayout={() => {
                            setIsVideoOverlayOpen(false);
                            setGlobalActiveRoomId(null);
                            setIncomingCallOffer(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default ChatPage;