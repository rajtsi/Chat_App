import Avatar from "./Avatar";

function ChatItem({ chat, isSelected, onClick, currentUser, isOnline }) {
    /*
    ROOM CHAT
    */

    const isRoom = chat.type === "ROOM";

    /*
    OTHER USER
    */

    const otherMember = chat.members?.find(
        (member) => member.id !== currentUser.id
    );

    /*
    DISPLAY DATA
    */

    const displayName = isRoom ? chat.name : otherMember?.displayName;

    const username = isRoom ? "room" : otherMember?.username;

    const avatar = isRoom ? "R" : otherMember.avatar;

    const hasUnreadMessages =
        chat.lastMessageAt &&
        (!chat.lastSeenAt ||
            new Date(chat.lastMessageAt) > new Date(chat.lastSeenAt));

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-800 transition
            ${isSelected ? "bg-[#2a3942]" : "hover:bg-[#2a3942]"}`}
        >
            {/* Avatar */}

            <div className="relative">
                <Avatar avatar={avatar} />
                {/* ONLINE DOT */}

                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#202c33]" />
                )}
            </div>

            {/* Content */}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-white font-medium truncate">{displayName}</h2>

                    {isRoom && <span className="text-xs text-green-400">ROOM</span>}
                    {hasUnreadMessages && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                </div>

                <p className="text-sm text-gray-400">@{username}</p>
            </div>
        </div>
    );
}

export default ChatItem;