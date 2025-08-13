import axios from "axios";

const API_BASE = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:4000";

export const getConversations = () => axios.get(`${API_BASE}/conversations`);
export const getMessages = (wa_id) => axios.get(`${API_BASE}/conversations/${wa_id}/messages`);
export const sendMessage = (wa_id, text) => axios.post(`${API_BASE}/conversations/${wa_id}/send`, { text });
