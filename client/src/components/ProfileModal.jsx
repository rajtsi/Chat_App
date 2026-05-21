import { useState, useEffect } from "react";
import { updateProfile } from "../api/auth.api";

function ProfileModal({ isOpen, onClose, user, isOwnProfile, isOnline }) {
    const [bio, setBio] = useState(user?.bio || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // Dynamic image preview tracker
    const [loading, setLoading] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);

    // Clean up temporary blob memory leakage when modal closes or file changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Reset temporary state metrics when the modal opens or user references change
    useEffect(() => {
        if (user) {
            setBio(user.bio || "");
            setAvatarFile(null);
            setPreviewUrl(null);
        }
    }, [isOpen, user]);

    if (!isOpen || !user) {
        return null;
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Instantly hooks file into client-side asset memory stream for live previewing
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSave() {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("bio", bio);

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const updatedUser = await updateProfile(formData);

            /*
            UPDATE LOCAL USER
            */
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.location.reload();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-[400px] bg-[#202c33] rounded-xl overflow-hidden shadow-2xl">
                {/* HEADER */}
                <div className="h-20 bg-[#111b21] flex items-center justify-between px-6">
                    <h1 className="text-white text-xl font-semibold">Profile</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 flex flex-col items-center">
                    <div className="flex items-center gap-5 mb-6 w-full px-3">
                        <div className="flex flex-col items-center">
                            {/* AVATAR ZONE */}
                            <div className="mb-4">
                                {previewUrl ? (
                                    // Displays temporary newly selected local preview image
                                    <img
                                        src={previewUrl}
                                        alt="preview"
                                        className="w-24 h-24 rounded-full object-cover ring-2 ring-green-500"
                                    />
                                ) : user.avatar?.startsWith("http") ? (
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {user.avatar}
                                    </div>
                                )}
                            </div>

                            {/* IMAGE PICKER */}
                            {isOwnProfile && (
                                <label className="w-fit px-3 border border-gray-600 rounded-lg py-1 text-center text-xs text-gray-300 cursor-pointer hover:bg-[#2a3942] hover:border-gray-500 transition whitespace-nowrap">
                                    Change Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* NAME & META INFO */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white text-2xl font-semibold truncate">
                                {user.displayName || user.name}
                            </h2>
                            <p className="text-gray-400 mb-2 truncate">@{user.username}</p>

                            {/* CHOSEN FILE NAME INDICATOR */}
                            {avatarFile && (
                                <p className="text-xs text-green-400 font-medium max-w-[180px] truncate">
                                    📎 {avatarFile.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        {/* BIO */}
                        <div className="bg-[#2a3942] p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-400 text-sm">Bio</p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => setIsEditingBio(!isEditingBio)}
                                        className="text-gray-400 hover:text-white transition"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </div>

                            {isOwnProfile && isEditingBio ? (
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-transparent text-white outline-none resize-none border-b border-gray-500 pb-1"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-white break-words">{bio || "No bio"}</p>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="bg-[#2a3942] p-3 rounded-lg">
                            <p className="text-gray-400 text-sm">Status</p>
                            <p className="text-white">{isOnline ? "🟢 Online" : "⚫ Offline"}</p>
                        </div>

                        {/* EMAIL */}
                        {isOwnProfile && (
                            <div className="bg-[#2a3942] p-3 rounded-lg">
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white truncate">{user.email}</p>
                            </div>
                        )}
                    </div>

                    {/* SAVE BUTTON */}
                    {isOwnProfile && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;