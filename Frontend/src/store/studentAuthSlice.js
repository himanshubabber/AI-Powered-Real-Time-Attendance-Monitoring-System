import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name:"",
    rollNo: "",
    photo: "",
}

const studentAuthSlice = createSlice({
    name: "studentAuth",
    initialState,
    reducers: {
        setStudentDetails: (state, action) => {
            const { name, rollNo, photo } = action.payload;
            state.name = name;
            state.rollNo = rollNo;
            state.photo = photo;
        },
        clearCustomerDetails: (state) => {
            state.name = "";
            state.rollNo = "";
            state.photo = "";
        },
    },
});

export const { setStudentDetails, clearStudentDetails} = studentAuthSlice.actions;
export default studentAuthSlice.reducer;