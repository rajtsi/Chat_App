import API from "./api";

export async function searchUsers(query) {

    const response =
        await API.get(
            `/auth/search?query=${query}`
        );
    //console.log("API response for searchUsers:", response.data.data);

    return response.data.data;

}