import {
    useEffect,
    useMemo,
    useState
} from "react";

import ChatItem from "./ChatItem";
import { searchUsers } from "../api/user.api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import Avatar from "./Avatar";
function Sidebar({
    currentUser,
    chats,
    search,
    setSearch,
    selectedChat,
    setSelectedChat,
    openProfileModal,
    onlineUsers
}) {

    const { logout } =
        useAuth();

    const [searchedUsers, setSearchedUsers] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer =
            setTimeout(() => {

                setDebouncedSearch(
                    search
                );

            }, 300);

        return () => {

            clearTimeout(timer);

        };

    }, [search]);

    useEffect(() => {

        async function fetchUsers() {

            if (!debouncedSearch.trim()) {
                setSearchedUsers([]);
                return;

            }

            try {

                const response =
                    await searchUsers(debouncedSearch);


                const filteredUsers =
                    response.filter(
                        (user) =>
                            user.id !== currentUser.id
                    );

                //console.log("Filtered users:", filteredUsers);
                setSearchedUsers(
                    filteredUsers
                );

            } catch (error) {

                console.log(error);

            }

        }

        fetchUsers();

    }, [debouncedSearch]);

    const filteredChats =
        useMemo(() => {

            return chats.filter(
                (chat) => {

                    const otherMember =
                        chat.members?.find(
                            (member) =>
                                member.id !== currentUser.id
                        );

                    const name =
                        otherMember?.displayName ||
                        chat.name ||
                        "";

                    return name
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );

                }
            );

        }, [search, chats, currentUser.id]);

    //console.log("filtered chats", filteredChats);

    return (
        <div className="w-[30%] bg-[#202c33] border-r border-gray-700 flex flex-col">

            {/* Header */}

            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-700">

                <h1 className="text-white text-2xl font-semibold">
                    Chats
                </h1>

                <button
                    onClick={() => {

                        socket.disconnect();

                        logout();

                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                    Logout
                </button>

            </div>

            {/* Search */}

            <div className="p-3 border-b border-gray-700">

                <input
                    type="text"
                    placeholder="Search users or chats"
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
                />

            </div>

            {/* Chats */}

            <div className="flex-1 overflow-y-auto min-h-0">

                {/* Existing Chats */}

                {filteredChats.length > 0 && (

                    <div className="px-3 py-2">

                        <h2 className="text-gray-400 text-sm mb-2">
                            Chats
                        </h2>

                        {filteredChats.map(
                            (chat) => {
                                const otherMember =
                                    chat.members?.find(
                                        (member) =>
                                            member.id !== currentUser.id
                                    );
                                return (

                                    <ChatItem
                                        key={chat.id}
                                        chat={chat}
                                        currentUser={
                                            currentUser
                                        }
                                        isSelected={
                                            selectedChat?.id ===
                                            chat.id
                                        }
                                        onClick={() =>
                                            setSelectedChat(chat)
                                        }
                                        isOnline={
                                            !!onlineUsers[
                                            otherMember?.id
                                            ]
                                        }
                                    />

                                )
                            }
                        )}

                    </div>

                )}

                {/* User Results */}

                {searchedUsers.length > 0 && (

                    <div className="px-3 py-2">

                        <h2 className="text-gray-400 text-sm mb-2">
                            Users
                        </h2>

                        {searchedUsers.map(
                            (user) => (

                                <div
                                    key={user.id}
                                    onClick={() => {

                                        const temporaryChat = {

                                            id: null,

                                            type: "DM",

                                            isTemporary: true,

                                            members: [
                                                currentUser,
                                                user
                                            ]

                                        };

                                        setSelectedChat(
                                            temporaryChat
                                        );

                                    }}
                                    className="flex items-center gap-3 p-3 hover:bg-[#2a3942] rounded-lg cursor-pointer transition"
                                >

                                    <Avatar
                                        avatar={user.avatar}
                                    />

                                    <div>

                                        <h3 className="text-white">
                                            {user.displayName}
                                        </h3>

                                        <p className="text-gray-400 text-sm">
                                            @{user.username}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

            {/* Bottom Profile */}

            <div
                onClick={() => {
                    //console.log("Opening profile modal for current user", currentUser);
                    openProfileModal(
                        currentUser,
                        true
                    )
                }}
                className="h-20 border-t border-gray-700 px-4 flex items-center gap-3 bg-[#1f2c34] cursor-pointer hover:bg-[#2a3942] transition"
            >

                <Avatar
                    avatar={currentUser.avatar}
                />

                <div className="flex-1">

                    <h2 className="text-white font-semibold">
                        {currentUser.displayName}
                    </h2>

                    <p className="text-sm text-gray-400">
                        @{currentUser.username}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Sidebar;