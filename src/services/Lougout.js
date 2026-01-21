import axiosClient from "../api/axiosClient";
import API_ENDPOINTS from "../api/endpoints";
import { userLoggedOut } from "../features/auth/authSlice";
import { clearAllErrors, setGeneralError } from "../features/error/errorSlice";

export const logoutUser = () => async (dispatch) => {
  dispatch(clearAllErrors());
  try {
    const response = await axiosClient.get(API_ENDPOINTS.LOGOUT);
    // console.log("from logout", response.data.success)
    if (response.data.success === true) {
      dispatch(userLoggedOut());
      localStorage.removeItem("authToken");
      return true;
    }
  } catch (error) {
    const errData = error?.response?.data;
    if (errData.message) {
      dispatch(setGeneralError(errData.message));
    }
  }
};
