import { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    /*
    LOGIN
    */

    function login(token, user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setToken(token);
        setUser(user);
    }

    /*
    LOGOUT
    */

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        socket.disconnect();
        setToken(null);
        setUser(null);
    }

    /*
    SOCKET LIFECYCLE
    */

    useEffect(() => {
        if (token) {
            socket.auth = { token };
            socket.connect();
        } else {
            socket.disconnect();
        }
    }, [token]);

    /*
    MULTI TAB AUTH SYNC
    */

    useEffect(() => {
        function syncAuth(event) {
            if (event.key === "token") {
                const updatedToken = localStorage.getItem("token");
                const updatedUser = JSON.parse(localStorage.getItem("user"));
                setToken(updatedToken);
                setUser(updatedUser);
            }
        }

        window.addEventListener("storage", syncAuth);

        return () => {
            window.removeEventListener("storage", syncAuth);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}