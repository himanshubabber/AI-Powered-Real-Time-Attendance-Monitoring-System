import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { setTeacherDetails } from '../../store/teacherAuthSlice.js';

export default function TeacherLogin() {
    const navigate=useNavigate();
    const dispatch=useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleBackClick = () => {
    navigate("/teacher/")
    // Add your navigation logic here
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.email || !formData.password) {
        alert("Please enter email and password");
        return;
      }
  
      // 1. Cleaned baseURL (Removed trailing slash)
      const api = axios.create({
        baseURL: "http://localhost:8000", 
        withCredentials: true,
        
        // https://ai-powered-real-time-attendence-mon.vercel.app
      });
  
      const response = await api.post(
        "/api/v1/teacher/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );
  
      // 2. Double check if your backend returns data inside a 'data' object
      // If your backend does res.json({ data: { teacher: ... } }) use this:
      const loggedInTeacher = response.data.data?.teacher || response.data.teacher;
  
      dispatch(setTeacherDetails(loggedInTeacher));
      alert("Login successful 🎉");
      navigate(`/teacher/auth/`);
  
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Invalid email or password";
      alert(message);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
          <p className="text-slate-600">Login to access your teacher account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <button
                onClick={() => console.log('Navigate to forgot password')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            type="button"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] mb-6"
          >
            Login
          </button>

          {/* Register Link */}
          <p className="text-center text-slate-600">
            Don't have an account?{' '}
            <button onClick={() => navigate("/teacher/register")} className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </button>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-slate-700 text-center">
            Having trouble logging in? Contact support at support@attendai.com
          </p>
        </div>
      </div>
    </div>
  );
}
