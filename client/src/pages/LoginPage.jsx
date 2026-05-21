import { useState } from "react";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const { login: loginUser } = useAuth();

    const [formData, setFormData] = useState({
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
            const response = await login(formData);

            loginUser(response.data.token, response.data.user);
            navigate("/chat");
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="h-screen bg-[#111b21] flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-[400px] bg-[#202c33] p-8 rounded-xl flex flex-col gap-4"
            >
                <h1 className="text-white text-3xl font-bold text-center">Login</h1>

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
                    Login
                </button>

                <p className="text-gray-400 text-center">
                    Don't have an account?
                    <Link to="/signup" className="text-green-400 ml-2">
                        Signup
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;