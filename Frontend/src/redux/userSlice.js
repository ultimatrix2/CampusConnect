import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";

/* ------------------------- SAFE LOCAL STORAGE PARSING ------------------------- */
let storedUser = null;
try {
  const raw = localStorage.getItem("user");
  storedUser = raw && raw !== "undefined" ? JSON.parse(raw) : null;
} catch (error) {
  console.warn("Invalid user in localStorage, resetting:", error);
  localStorage.removeItem("user");
  storedUser = null;
}

/* ------------------------- ASYNC THUNK TO FETCH ALL USERS ------------------------- */
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/user/get-all-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // ✅ Only serializable data
      return response.data.data;
    } catch (error) {
      // ✅ Return plain object
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
);

/* ------------------------- INITIAL STATE ------------------------- */
const initialState = {
  user: null, // detailed user info
  allUsers: [],
  allChats: [],
  selectedChat: null,
  currentUser: storedUser,
  errorMessage: null,
};

/* ------------------------- USER SLICE ------------------------- */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Login success
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.errorMessage = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Set detailed user info or error
    setUser: (state, action) => {
      state.user = action.payload.user || null;
      state.errorMessage = action.payload.errorMessage || null;
    },

    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },

    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },

    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    // Logout
    logout: (state) => {
      state.currentUser = null;
      state.user = null;
      state.errorMessage = null;
      state.allUsers = [];
      state.allChats = [];
      state.selectedChat = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.errorMessage = action.payload?.message || "Failed to fetch users";
        console.error("Failed to fetch users:", state.errorMessage);
      });
  },
});

/* ------------------------- EXPORT ACTIONS & REDUCER ------------------------- */
export const {
  loginSuccess,
  logout,
  setUser,
  setAllUsers,
  setAllChats,
  setSelectedChat,
} = userSlice.actions;

export default userSlice.reducer;
