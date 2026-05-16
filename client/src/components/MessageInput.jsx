function MessageInput() {

    return (
        <div className="h-20 bg-[#202c33] flex items-center px-4 gap-4">

            <input
                type="text"
                placeholder="Type a message"
                className="flex-1 bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
            />

            <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
            >
                Send
            </button>

        </div>
    );
}

export default MessageInput;