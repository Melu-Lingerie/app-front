// src/axios/api.ts
import axios from 'axios';
import qs from 'qs';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
});

export default api;
