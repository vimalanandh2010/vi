import axiosClient from '../api/axiosClient';

const BASE = '/chat-module';

// ── Profile ──────────────────────────────────────────────
export const getMyProfile = () =>
    axiosClient.get(`${BASE}/profile/me`);

export const setupUsername = (chat_username, displayName) =>
    axiosClient.post(`${BASE}/profile/setup`, { chat_username, displayName });

export const checkUsername = (u) =>
    axiosClient.get(`${BASE}/check-username?u=${encodeURIComponent(u)}`);

// ── Search ────────────────────────────────────────────────
export const searchUsers = (q) =>
    axiosClient.get(`${BASE}/search?q=${encodeURIComponent(q)}`);

// ── Conversations ─────────────────────────────────────────
export const getConversations = () =>
    axiosClient.get(`${BASE}/conversations`);

export const startConversation = (target_username) =>
    axiosClient.post(`${BASE}/conversations/start`, { target_username });

// ── Messages ──────────────────────────────────────────────
export const getMessages = (conversationId) =>
    axiosClient.get(`${BASE}/conversations/${conversationId}/messages`);

export const sendMessage = (conversationId, content) =>
    axiosClient.post(`${BASE}/conversations/${conversationId}/messages`, { content });

export const markSeen = (conversationId) =>
    axiosClient.put(`${BASE}/conversations/${conversationId}/seen`);
