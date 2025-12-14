import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  studentId: null,
  name: null,
  rollNo: null,
  photo: null,
  accessToken: null, // 👈 1. Make sure this exists in initialState
  isAuthenticated: false,
};

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    setStudentDetails: (state, action) => {
      // 👈 2. Check if your login page sends the whole object or just 'student'
      // If action.payload contains everything mixed together:
      state.studentId = action.payload._id || action.payload.studentId;
      state.name = action.payload.name;
      state.rollNo = action.payload.rollNo;
      state.photo = action.payload.photo;
      
      // ✅ 3. CRITICAL: Save the token!
      state.accessToken = action.payload.accessToken; 
      
      state.isAuthenticated = true;
    },
    clearStudentDetails: (state) => {
      state.studentId = null;
      state.name = null;
      state.rollNo = null;
      state.photo = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setStudentDetails, clearStudentDetails } = studentAuthSlice.actions;
export default studentAuthSlice.reducer;
