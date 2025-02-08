import { createSlice , createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try{
      const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/user/get-all-users', {headers: {Authorization: `Bearer ${token}`}});
        return response.data.data;
    }catch(error){
        return error;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    allUsers: [],
    allChats: [],
    selectedChat: null,
    currentUser: JSON.parse(localStorage.getItem("user")) || null,
  },
  reducers: {
    loginSuccess: (state, action) => { 
      state.currentUser = action.payload;
      console.log(action.payload)
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setUser:(state,action)=>{ state.user=action.payload; },
    setAllUsers: (state, action) => { state.allUsers = action.payload; },
    setAllChats: (state, action) => { state.allChats = action.payload; },
    setSelectedChat: (state, action) => { state.selectedChat = action.payload; },
    logout: (state) => { 
      state.currentUser = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload; 
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        console.error("Failed to fetch users:", action.payload);
      });
  },
});

export const { loginSuccess, logout,setUser, setAllUsers, setAllChats, setSelectedChat } = userSlice.actions;
export default userSlice.reducer;