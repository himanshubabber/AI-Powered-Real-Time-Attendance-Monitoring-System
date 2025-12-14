import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogIn, UserPlus, BookOpen, Users, CheckCircle } from 'lucide-react';

export default function StudentAuthPage() {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/")
  };

  const handleLogin = () => {
    navigate("login")
    // Add your navigation logic here
    // Example: navigate('/student/login')
  };

  const handleRegister = () => {
    navigate("register");
    // Add your navigation logic here
    // Example: navigate('/student/register')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors"
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
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-3">
              <BookOpen className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Welcome, Student!</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join your classes, track your attendance, and stay connected with your academic progress through automated AI technology.
          </p>
        </div>

        {/* Authentication Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Login Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-green-500">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="text-green-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Login</h2>
            <p className="text-slate-600 text-center mb-6">
              Already registered? Sign in to view your attendance records and enrolled classes.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Login to Account
            </button>
          </div>

          {/* Register Card */}
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-emerald-500">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="text-emerald-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Register</h2>
            <p className="text-slate-600 text-center mb-6">
              New here? Create your account with your photo and start joining classes today.
            </p>
            <button
              onClick={handleRegister}
              className="w-full bg-white border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
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
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Camera className="text-green-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Register with Photo</h4>
              <p className="text-slate-600">
                Upload your photo once during registration for automatic face recognition.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Join Classes</h4>
              <p className="text-slate-600">
                Use unique class codes provided by your teachers to enroll in classes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-blue-600" size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Track Attendance</h4>
              <p className="text-slate-600">
                View your attendance records and monitor your participation in all classes.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Why Students Love AttendAI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">No manual roll call needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Instant attendance marking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-slate-700 font-medium">Track your own attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}