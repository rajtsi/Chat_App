function MessageBubble({
    message,
    currentUser
}) {

    const isMine =
        message.from === currentUser.name;

    return (
        <div
            className={`max-w-[300px] px-4 py-2 rounded-lg text-white
      ${isMine
                    ? "bg-[#005c4b] self-end"
                    : "bg-[#202c33] self-start"
                }`}
        >

            <p className="text-sm font-semibold mb-1">
                {message.from}
            </p>

            <p>
                {message.message}
            </p>

        </div>
    );
}

export default MessageBubble;