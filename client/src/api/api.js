import axios from "axios";
import config from "../config";

const API = axios.create({
    baseURL:
        `${config.API_URL}/api`
});

/*
ATTACH TOKEN
*/

API.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    }

);

export default API;