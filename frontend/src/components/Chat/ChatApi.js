import axiosClient from '../../api/axiosClient';

const BASE = '/social-chat';

export const getMyProfile = () => axiosClient.get(`${BASE}/profile/me`);
export const setupProfile = (data) => axiosClient.post(`${BASE}/profile/setup`, data);
export const searchUsers = (q) => axiosClient.get(`${BASE}/search?q=${q}`);
export const getConversations = () => axiosClient.get(`${BASE}/conversations`);
export const startConversation = (target_handle) => axiosClient.post(`${BASE}/conversations/start`, { target_handle });
export const getMessages = (convoId) => axiosClient.get(`${BASE}/conversations/${convoId}/messages`);
export const sendMessage = (convoId, data) => axiosClient.post(`${BASE}/conversations/${convoId}/messages`, data);
