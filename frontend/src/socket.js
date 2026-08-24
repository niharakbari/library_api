import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;


const socket = io(backendURL, {
    withCredentials: true,
});

export default socket;