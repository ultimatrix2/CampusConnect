import { axiosInstance } from "./index";

//  currently logged-in users from  backend
export const getLoggedUser = async () => {
  try {
    const response = await axiosInstance.get("api/users/get-logged-user");
    console.log("Logged user response:", response);

    return { user: response.data.data, errorMessage: null };
  } catch (error) {
    console.error("Error fetching logged user:", error);

    return {
      user: null,
      errorMessage:
        error.response?.data?.message || error.message || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};
