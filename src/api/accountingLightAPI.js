import { IP_ADD } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

class AccountingLightAPI {
    buildQueryString(filters) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                params.append(key, value);
            }
        });
        return params.toString();
    }

    async request(endpoint, filters = {}, token = null) {
        const query = this.buildQueryString(filters);
        const url = `${IP_ADD}${endpoint}${query ? `?${query}` : ''}`;
        const axiosInstance = token ? setupAxiosInterceptors(token) : setupAxiosInterceptors();

        try {
            const response = await axiosInstance.get(url);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }

    getAccountingLight(filters = {}, token = null) {
        return this.request('/accounting/light', filters, token);
    }
}

export const accountingLightAPI = new AccountingLightAPI();
