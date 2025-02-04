import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; 
const store = configureStore({
  reducer: {
    user: userReducer, // Ensure this matches `useSelector((state) => state.user)`
  },
});

export default store;
