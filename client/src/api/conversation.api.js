import API from "./api";

export async function getConversations() {

    const response =
        await API.get("/conversations");

    return response.data.data;

}

export async function createDM(targetUserId) {

    const response =
        await API.post(
            "/conversations/dm",
            {
                targetUserId
            }
        );

    return response.data.data;

}