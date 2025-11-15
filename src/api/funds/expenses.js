// api/services/expenses/expensesService.js
import { IP_ADD_INVESTMENT } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

// Créer un type de dépense
const createExpenseType = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD_INVESTMENT}/expenses/types/create`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir tous les types de dépenses
const getAllExpenseTypes = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/types/list`)
    .then(handleResponse)
    .catch(handleError);
};

// Créer une dépense
const createExpense = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD_INVESTMENT}/expenses/create`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir toutes les dépenses
const getAllExpenses = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/list?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir une dépense par ID
const getExpenseById = async (expenseId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/${expenseId}`)
    .then(handleResponse)
    .catch(handleError);
};

// Annuler une dépense
const cancelExpense = async (expenseId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/expenses/${expenseId}/cancel`)
    .then(handleResponse)
    .catch(handleError);
};

// Filtrer les dépenses
const filterExpenses = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/filter?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir les statistiques des dépenses
const getExpenseStatistics = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/statistics?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

const getGlobalExpenseStatistics = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/expenses/statistics/global`)
    .then(handleResponse)
    .catch(handleError);
};

const ExpensesApi = {
  createExpenseType,
  getAllExpenseTypes,
  createExpense,
  getAllExpenses,
  getExpenseById,
  cancelExpense,
  filterExpenses,
  getExpenseStatistics,
  getGlobalExpenseStatistics
};

export default ExpensesApi;