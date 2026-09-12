import { CHALLENGE_IP } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const BASE = `${CHALLENGE_IP}/api/v0`;

/**
 * POST /admin/transactions
 * Admin crée un dépôt ou retrait sur le compte d'un user.
 * autoValidate: true → crédit/débit immédiat (admin only).
 */
const createUserTransaction = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${BASE}/admin/transactions`, data)
    .then(handleResponse)
    .catch(handleError);
};

/**
 * PATCH /admin/transactions/verify
 * Body: { kind, userId, transactionId, valid, montant? }
 */
const verifyUserTransaction = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .patch(`${BASE}/admin/transactions/verify`, data)
    .then(handleResponse)
    .catch(handleError);
};

/**
 * GET /admin/transactions/history
 * params: userId?, kind?, etat?, page?, limit?
 */
const getTransactionHistory = async (params = {}, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${BASE}/admin/transactions/history`, { params })
    .then(handleResponse)
    .catch(handleError);
};

/** Devises depuis le même host que les transactions admin */
const getDevises = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${BASE}/devise/list`).then(handleResponse).catch(handleError);
};

/**
 * GET /admin/users/search?q=
 * Recherche email / nom / prénom / téléphone
 */
const searchUsers = async (q, token, limit = 12) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${BASE}/admin/users/search`, { params: { q, limit } })
    .then(handleResponse)
    .catch(handleError);
};

/**
 * GET /admin/users/:id — fiche courte + soldes
 */
const getUserBrief = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${BASE}/admin/users/${id}`).then(handleResponse).catch(handleError);
};

const AdminTransactionsApi = {
  createUserTransaction,
  verifyUserTransaction,
  getTransactionHistory,
  getDevises,
  searchUsers,
  getUserBrief
};

export default AdminTransactionsApi;
