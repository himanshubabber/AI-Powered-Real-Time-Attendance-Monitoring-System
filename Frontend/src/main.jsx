import './main.css'
import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store.js';
import { RouterProvider } from "react-router-dom";
import LandingPage from './Pages/LandingPage.jsx';
import TeacherAuthPage from './Pages/Teacher/TeacherAuthPage.jsx';
import TeacherRegister from './Pages/Teacher/TeacherRegister.jsx';
import TeacherLogin from './Pages/Teacher/TeacherLogin.jsx';
import StudentAuthPage from './Pages/Student/StudentAuthPage.jsx';
import StudentRegister from './Pages/Student/StudentRegister.jsx';
import StudentLogin from './Pages/Student/StudentLogin.jsx';
import ClassDashboard from './Pages/Teacher/ClassDashboard.jsx';
import ClassDetailPage from './Pages/Teacher/ClassDetailPage.jsx';
import MarkAttendancePage from './Pages/Teacher/MarkAttendancePage.jsx';
import AttendanceDetailPage from './Pages/Teacher/AttendanceDetailPage.jsx';
import StudentDashboard from './pages/Student/StudentDashboard.jsx';
import StudentClassDetail from './Pages/Student/StudentClassDetail.jsx';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
     <Route path="" element={<LandingPage />}/>
     <Route path="teacher/">
        <Route path="" element={<TeacherAuthPage />} />
        <Route path="register" element={<TeacherRegister/>} />
        <Route path="login" element={<TeacherLogin/>} />
        <Route path="auth/" >
            <Route path="" element={<ClassDashboard/>} />
            <Route path="class/:classId/">
                <Route path="" element={<ClassDetailPage/>} />
                <Route path=":date" element={<AttendanceDetailPage/>}/>
                <Route path="mark-attendance" element={<MarkAttendancePage/>} />
            </Route>  
        </Route>
     </Route>
     <Route path="student/">
        <Route path="" element={<StudentAuthPage />} />
        <Route path="register" element={<StudentRegister/>} />
        <Route path="login" element={<StudentLogin/>} />
        <Route path="auth/" >
            <Route path="" element={<StudentDashboard/>} /> 
            <Route path="class/:classId/" element={<StudentClassDetail/>} />
        </Route>
     </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
