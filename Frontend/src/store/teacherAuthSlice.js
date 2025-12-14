import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name:"",
    photo: "",
}

const teacherAuthSlice = createSlice({
    name: "teacherAuth",
    initialState,
    reducers: {
        setTeacherDetails: (state, action) => {
            const { name, photo } = action.payload;
            state.name = name;
            state.photo = photo;
        },
        clearTeacherDetails: (state) => {
            state.name = "";
            state.photo = "";
        },
    },
});

export const { setTeacherDetails, clearTeacherDetails} = teacherAuthSlice.actions;
export default teacherAuthSlice.reducer;