import { useEffect, useState } from "react";
import { searchUsers } from "../api/user.api";

function SearchModal({ currentUser, onSelectUser, onClose }) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            if (!query.trim()) {
                setUsers([]);
                return;
            }

            try {
                const response = await searchUsers(query);
                const filteredUsers = response.data.filter(
                    (user) => user.id !== currentUser.id
                );
                setUsers(filteredUsers);
            } catch (error) {
                console.log(error);
            }
        }

        fetchUsers();
    }, [query]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-[400px] bg-[#202c33] rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-xl font-semibold">Start New Chat</h2>
                    <button onClick={onClose} className="text-white text-xl">
                        ×
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search user..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none mb-4"
                />

                <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => onSelectUser(user)}
                            className="flex items-center gap-3 p-3 hover:bg-[#2a3942] rounded-lg cursor-pointer transition"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                                {user.avatar}
                            </div>

                            <div>
                                <h3 className="text-white">{user.displayName}</h3>
                                <p className="text-gray-400 text-sm">@{user.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchModal;