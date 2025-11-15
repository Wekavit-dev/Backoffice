// api/services/loans/loansService.js
import { IP_ADD_INVESTMENT } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

// Créer un prêt
const createLoan = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${IP_ADD_INVESTMENT}/loans/create`, data)
    .then(handleResponse)
    .catch(handleError);
};

// Approuver un prêt
const approveLoan = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/loans/${loanId}/approve`)
    .then(handleResponse)
    .catch(handleError);
};

// Générer le document de reconnaissance
const generateLoanAgreement = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/${loanId}/generate-agreement`, {
    responseType: 'blob' // Important pour les fichiers
  })
    .then(handleResponse)
    .catch(handleError);
};

// Télécharger le document de reconnaissance
const downloadLoanAgreement = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/${loanId}/download-agreement`, {
    responseType: 'blob'
  })
    .then(handleResponse)
    .catch(handleError);
};

// Marquer le document comme signé
const markDocumentSigned = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/loans/${loanId}/mark-signed`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir tous les prêts
const getAllLoans = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/list?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir un prêt par ID
const getLoanById = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/${loanId}`)
    .then(handleResponse)
    .catch(handleError);
};

// Annuler un prêt
const cancelLoan = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/loans/${loanId}/cancel`)
    .then(handleResponse)
    .catch(handleError);
};

// Marquer un prêt comme complété
const completeLoan = async (loanId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${IP_ADD_INVESTMENT}/loans/${loanId}/complete`)
    .then(handleResponse)
    .catch(handleError);
};

// Filtrer les prêts
const filterLoans = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/filter?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

// Obtenir les statistiques des prêts
const getLoanStatistics = async (params, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const queryParams = new URLSearchParams(params).toString();
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/statistics?${queryParams}`)
    .then(handleResponse)
    .catch(handleError);
};

const getGlobalLoanStatistics = async (token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${IP_ADD_INVESTMENT}/loans/statistics/global`)
    .then(handleResponse)
    .catch(handleError);
};

const LoansApi = {
  createLoan,
  approveLoan,
  generateLoanAgreement,
  downloadLoanAgreement,
  markDocumentSigned,
  getAllLoans,
  getLoanById,
  cancelLoan,
  completeLoan,
  filterLoans,
  getLoanStatistics,
  getGlobalLoanStatistics
};

export default LoansApi;