import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const register = async (userData) => {
    const response = await axios.post(`${API_URL}/users/register`, userData, {
        withCredentials: true, // if your backend uses cookies for session
    });
    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(`${API_URL}/users/login`, userData, {
        withCredentials: true,
    });
    return response.data;
};

const getCurrentUser = async () => {
    const response = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
    return response.data.user;
};

export default {
    register,
    login,
    getCurrentUser,
};