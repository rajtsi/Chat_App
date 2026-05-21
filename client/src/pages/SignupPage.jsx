import { useState } from "react";
import { signup } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: "",
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await signup(formData);
            navigate("/chat");
        } catch (error) {
            alert(error.response?.data?.message || "Signup failed");
        }
    };

    return (
        <div className="h-screen bg-[#111b21] flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-[400px] bg-[#202c33] p-8 rounded-xl flex flex-col gap-4"
            >
                <h1 className="text-white text-3xl font-bold text-center">
                    Create Account
                </h1>

                <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-[#2a3942] text-white px-4 py-3 rounded-lg outline-none"
                />

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
                >
                    Signup
                </button>

                <p className="text-gray-400 text-center">
                    Already have an account?
                    <Link to="/login" className="text-green-400 ml-2">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default SignupPage;