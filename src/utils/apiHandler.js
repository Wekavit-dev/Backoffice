// api/utils/apiHandler.js
export const callApi = async (apiCall) => {
  try {
    const response = await apiCall();

    // Determine success
    const isSuccess =
      response.status === 200 ||
      response.status === 201 ||
      (response.data && (response.data.status === 200 || response.data.status === 201)) ||
      response.success === true ||
      (response.data && response.data.success === true) ||
      (response.data && !response.data.error);

    if (isSuccess) {
      return { success: true, data: response.data || response };
    }

    // If API returned error
    return { success: false, error: response.data?.error || 'Unknown error', response };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, error: error.message || 'Network error', details: error };
  }
};
