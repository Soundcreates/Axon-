import axios from "axios";

export const server = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://axon-p64m.onrender.com/api",
  withCredentials: true,
})