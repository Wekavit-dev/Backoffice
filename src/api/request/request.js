export const handleResponse = async (response) => {
  if (response.status == (200 || 201 || 400 || 401 || 404)) {
    return response;
  } else {
    return { message: 'something went wrong' };
  }
};
export const handleError = async (err) => {
  throw err;
};
