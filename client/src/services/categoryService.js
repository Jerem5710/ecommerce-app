import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const getCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`, {
        withCredentials: true
    });
    return response.data;
};

export default {
    getCategories,
};