import axios from "axios";
import { API_BASE, API_URL } from "./apiConfig";

const POSTS_URL = `${API_URL}/posts`;

export const createPost = (data) => axios.post(POSTS_URL, data, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const getPosts = (userId) => axios.get(POSTS_URL, {
    params: { userId }
});
export const getPostById = (id, userId) => axios.get(`${POSTS_URL}/${id}`, {
    params: { userId }
});
export const deletePost = (id) => axios.delete(`${POSTS_URL}/${id}`);

// Likes API
export const toggleLikePost = (postId, userId) => axios.post(`${POSTS_URL}/like`, { postId, userId });

// Users API
export const updateProfile = (profileData) => axios.post(`${API_URL}/users/update`, profileData);
export const getProfile = (userId) => axios.get(`${API_URL}/users/${userId}`);

// Custom Auth API
export const loginUser = (email, password) => axios.post(`${API_URL}/auth/login`, { email, password });
export const registerUser = (email, password) => axios.post(`${API_URL}/auth/register`, { email, password });
