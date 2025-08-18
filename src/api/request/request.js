export const handleResponse = async (response) => {
  const validStatuses = [200, 201, 400, 401, 404];
  if (validStatuses.includes(response.status)) {
    return response;
  }
  return { message: 'something went wrong' };
};

export const handleError = async (err) => {
  if (err.response) {
    // API responded with an error code
    return Promise.reject(err.response);
  }
  return Promise.reject({ message: err.message || 'Network error' });
};
