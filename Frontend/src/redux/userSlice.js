import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    allUsers: [],
    allChats: [],
    selectedChat: null,
  },
  reducers: {
    loginSuccess: (state, action) => { state.currentUser = action.payload; },
    setAllUsers: (state, action) => { state.allUsers = action.payload; },
    setAllChats: (state, action) => { state.allChats = action.payload; },
    setSelectedChat: (state, action) => { state.selectedChat = action.payload; },
    logout: (state) => { state.currentUser = null; },
  },
});

export const { loginSuccess, logout, setAllUsers, setAllChats, setSelectedChat } = userSlice.actions;
export default userSlice.reducer;