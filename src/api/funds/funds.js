// api/services/funds/fundsService.js
import { IP_ADD_INVESTMENT } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

// Créer un nouveau fonds
const createFund = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD_INVESTMENT}/funds/create`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir tous les fonds
const getAllFunds = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/list`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir un fonds par ID
const getFundById = async (fundId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/${fundId}`)
    .then(handleResponse)
    .catch(handleError);
};

// Mettre à jour un fonds
const updateFund = async (fundId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/funds/${fundId}/update`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Supprimer un fonds
const deleteFund = async (fundId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.delete(`${IP_ADD_INVESTMENT}/funds/${fundId}/delete`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir le solde total par devise
const getTotalBalanceByCurrency = async (token) => {
    console.log("tokkkken", token);
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/balance/currency`)
    .then(handleResponse)
    .catch(handleError);
};

// Ajouter une entrée de fonds
const addFundEntry = async (fundId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD_INVESTMENT}/funds/${fundId}/entries/add`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir les entrées d'un fonds
const getFundEntries = async (fundId, params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/${fundId}/entries?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir les statistiques d'un fonds
const getFundStatistics = async (fundId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/${fundId}/statistics`)
    .then(handleResponse)
    .catch(handleError);
};

// Filtrer les entrées de fonds
const filterFundEntries = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/funds/entries/filter?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Marquer une entrée comme retournée
const markEntryAsReturned = async (entryId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/funds/entries/${entryId}/return`, data)
    .then(handleResponse)
    .catch(handleError);
};

const FundsApi = {
  createFund,
  getAllFunds,
  getFundById,
  updateFund,
  deleteFund,
  getTotalBalanceByCurrency,
  addFundEntry,
  getFundEntries,
  getFundStatistics,
  filterFundEntries,
  markEntryAsReturned
};

export default FundsApi;