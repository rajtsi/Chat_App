
import API from "./api";
export async function getMessages(conversationId) {

    const response =
        await API.get(
            `/messages/${conversationId}`
        );

    return response.data.data;

}