import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from './api';

export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    const { baseURL, ...rest } = config;
    const response: AxiosResponse<T> = await api.request(rest);
    return response.data;
};
