import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

class FeesAPI {
    // Convertir les filtres en query string
    buildQueryString(filters) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(`${key}[]`, v));
                } else {
                    params.append(key, value);
                }
            }
        });
        return params.toString();
    }

    async request(endpoint, filters = {}, token = null) {
        const query = this.buildQueryString(filters);
        const url = `${IP_ADD}${endpoint}${query ? `?${query}` : ''}`;

        // Si un token est fourni, créer une instance avec token
        const axiosInstance = token ? setupAxiosInterceptors(token) : setupAxiosInterceptors();

        try {
            const response = await axiosInstance.get(url);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }

    getDashboard(filters = {}, token = null) {
        return this.request('/dashboard', filters, token);
    }

    getTimeline(filters = {}, token = null) {
        return this.request('/timeline', filters, token);
    }

    getTopPayers(filters = {}, token = null) {
        return this.request('/top-payers', filters, token);
    }

    getTransactions(filters = {}, token = null) {
        return this.request('/transactions', filters, token);
    }

    getStatsByDevise(filters = {}, token = null) {
        return this.request('/by-devise', filters, token);
    }

    async getTransactionTypes(token = null) {
        const axiosInstance = token ? setupAxiosInterceptors(token) : setupAxiosInterceptors();
        try {
            const response = await axiosInstance.get(`${IP_ADD}/transaction-types`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }

    getExportUrl(filters = {}, token = null) {
        const query = this.buildQueryString({ ...filters, format: 'csv' });
        const authQuery = token ? this.buildQueryString({ key: token }) : '';
        const separator = query && authQuery ? '&' : '';
        return `${IP_ADD}/export${query ? `?${query}` : ''}${separator}${authQuery}`;
    }
}

export const feesAPI = new FeesAPI();