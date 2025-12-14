import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogIn, UserPlus, GraduationCap, Users, Clock } from 'lucide-react';

export default function TeacherAuthPage() {
  const navigate= useNavigate();
  const handleBackClick = () => {
    navigate("/")
  };

  const handleLogin = () => {
    navigate("login")
  };

  const handleRegister = () => {
    navigate("register")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-3">
              <GraduationCap className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Welcome, Teacher!</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your classes, track attendance, and monitor student participation effortlessly with AI-powered technology.
          </p>
        </div>

        {/* Authentication Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Login Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-blue-500">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="text-blue-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Login</h2>
            <p className="text-slate-600 text-center mb-6">
              Already have an account? Sign in to access your classes and attendance records.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Login to Account
            </button>
          </div>

          {/* Register Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-indigo-500">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="text-indigo-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Register</h2>
            <p className="text-slate-600 text-center mb-6">
              New to AttendAI? Create your account and start managing attendance in minutes.
            </p>
            <button
              onClick={handleRegister}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Create Account
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">What You Can Do</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Create Classes</h4>
              <p className="text-slate-600">
                Set up multiple classes with unique codes for easy student enrollment.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Camera className="text-purple-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Mark Attendance</h4>
              <p className="text-slate-600">
                Take one photo and let AI automatically mark attendance for all students.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-green-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Track Records</h4>
              <p className="text-slate-600">
                View detailed attendance history and generate comprehensive reports.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Why Teachers Love AttendAI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Save 10+ minutes per class</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">99% accurate face recognition</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Access from anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}