import { configureStore } from "@reduxjs/toolkit";
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, 
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import studentauthreducer from "./studentAuthSlice.js";
import teacherauthreducer from "./teacherAuthSlice.js";

const studentPersistConfig = {
  key: "studentAuth",
  storage,
};

const teacherPersistConfig = {
  key: "teacherAuth",
  storage,
};

const studentAuthReducer = persistReducer(studentPersistConfig, studentauthreducer);
const teacherAuthReducer = persistReducer(teacherPersistConfig, teacherauthreducer);

export const store = configureStore({
  reducer: {
    studentAuth: studentAuthReducer,
    teacherAuth: teacherAuthReducer,
  },
  // 👇 THIS BLOCK FIXES THE ERROR
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
