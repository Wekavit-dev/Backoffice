import { CHALLENGE_IP } from 'api/utils/address';
import { handleError, handleResponse } from 'api/request/request';
import setupAxiosInterceptors from 'api/utils/instance';

const CHALLENGE_BASE = `${CHALLENGE_IP}/api/v0`;

const listChallenges = async (params = {}, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${CHALLENGE_BASE}/admin/challenges`, { params })
    .then(handleResponse)
    .catch(handleError);
};

const getChallenge = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.get(`${CHALLENGE_BASE}/admin/challenges/${id}`).then(handleResponse).catch(handleError);
};

const createChallenge = async (data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.post(`${CHALLENGE_BASE}/admin/challenges`, data).then(handleResponse).catch(handleError);
};

const updateChallenge = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken.put(`${CHALLENGE_BASE}/admin/challenges/${id}`, data).then(handleResponse).catch(handleError);
};

const updateChallengeRules = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .put(`${CHALLENGE_BASE}/admin/challenges/${id}/rules`, data)
    .then(handleResponse)
    .catch(handleError);
};

const updateWinnerPrizes = async (id, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .put(`${CHALLENGE_BASE}/admin/challenges/${id}/winner-prizes`, data)
    .then(handleResponse)
    .catch(handleError);
};

const publishChallenge = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${id}/publish`)
    .then(handleResponse)
    .catch(handleError);
};

const unpublishChallenge = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${id}/unpublish`)
    .then(handleResponse)
    .catch(handleError);
};

const getChallengeRanking = async (id, params = {}, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${CHALLENGE_BASE}/admin/challenges/${id}/ranking`, { params })
    .then(handleResponse)
    .catch(handleError);
};

const getMissedPayments = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${CHALLENGE_BASE}/admin/challenges/${id}/missed-payments`)
    .then(handleResponse)
    .catch(handleError);
};

const checkMissedPayments = async (id, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${id}/missed-payments/check`)
    .then(handleResponse)
    .catch(handleError);
};

const waiveMissedPayment = async (challengeId, userId, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${challengeId}/members/${userId}/waive-missed`, data)
    .then(handleResponse)
    .catch(handleError);
};

const disqualifyMember = async (challengeId, userId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${challengeId}/members/${userId}/disqualify`)
    .then(handleResponse)
    .catch(handleError);
};

const reinstateMember = async (challengeId, userId, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/${challengeId}/members/${userId}/reinstate`)
    .then(handleResponse)
    .catch(handleError);
};

const listRuleTemplates = async (params = {}, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .get(`${CHALLENGE_BASE}/admin/challenge-rules`, { params })
    .then(handleResponse)
    .catch(handleError);
};

const updateRuleTemplate = async (slug, data, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  return axiosInstanceWithToken
    .put(`${CHALLENGE_BASE}/admin/challenge-rules/${slug}`, data)
    .then(handleResponse)
    .catch(handleError);
};

const uploadCoverImage = async (file, token) => {
  const axiosInstanceWithToken = setupAxiosInterceptors(token);
  const formData = new FormData();
  formData.append('coverImage', file);
  return axiosInstanceWithToken
    .post(`${CHALLENGE_BASE}/admin/challenges/upload-cover`, formData)
    .then(handleResponse)
    .catch(handleError);
};

const ChallengesApi = {
  listChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  updateChallengeRules,
  updateWinnerPrizes,
  publishChallenge,
  unpublishChallenge,
  getChallengeRanking,
  getMissedPayments,
  checkMissedPayments,
  waiveMissedPayment,
  disqualifyMember,
  reinstateMember,
  listRuleTemplates,
  updateRuleTemplate,
  uploadCoverImage
};

export default ChallengesApi;
