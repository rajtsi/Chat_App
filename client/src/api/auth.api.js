import API from "./api";

export async function signup(data) {
    const response = await API.post("/auth/signup", data);
    return response.data;
}

export async function login(data) {
    const response = await API.post("/auth/login", data);
    return response.data;
}

export async function updateProfile(formData) {
    const response = await API.patch("/auth/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data.data;
}