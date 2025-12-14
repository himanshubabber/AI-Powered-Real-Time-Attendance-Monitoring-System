import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Camera, Users, Clock, CheckCircle, Shield, Zap, ArrowRight, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const navigate=useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSelection = (role) => {
    console.log(`User selected role: ${role}`);
    // Add your navigation logic here
    // Example: navigate(`/${role}/login`) or navigate(`/${role}/register`)
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                <Camera className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AttendAI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Benefits
              </a>
              <button
                onClick={() => handleRoleSelection('login')}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-600 hover:text-blue-600 font-medium py-2">
                Features
              </a>
              <a href="#how-it-works" className="block text-slate-600 hover:text-blue-600 font-medium py-2">
                How It Works
              </a>
              <a href="#benefits" className="block text-slate-600 hover:text-blue-600 font-medium py-2">
                Benefits
              </a>
              <button
                onClick={() => handleRoleSelection('login')}
                className="block w-full text-left text-slate-600 hover:text-blue-600 font-medium py-2"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Smart Attendance,
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Powered by AI</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Revolutionize your classroom with automatic facial recognition attendance. 
              No more roll calls, no more manual tracking. Just snap, submit, and you're done.
            </p>

            {/* Role Selection Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate("/teacher")}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 w-full sm:w-auto"
              >
                <Users size={24} />
                I'm a Teacher
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/student")}
                className="group relative overflow-hidden bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center gap-3 w-full sm:w-auto"
              >
                <CheckCircle size={24} />
                I'm a Student
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Trusted by over 500+ educational institutions worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600">Everything you need for seamless attendance management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-blue-600 rounded-lg p-3 w-fit mb-4">
                <Camera className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Face Recognition</h3>
              <p className="text-slate-600">
                Advanced AI technology automatically identifies and marks student attendance from class photos with 99% accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-purple-600 rounded-lg p-3 w-fit mb-4">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Processing</h3>
              <p className="text-slate-600">
                Upload one photo and attendance is marked in seconds. Save hours of manual roll call time every week.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-green-600 rounded-lg p-3 w-fit mb-4">
                <Clock className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Records</h3>
              <p className="text-slate-600">
                Access attendance data anytime, anywhere. View reports, track trends, and monitor student participation instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-orange-600 rounded-lg p-3 w-fit mb-4">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Enrollment</h3>
              <p className="text-slate-600">
                Students register once with their photo and join classes using unique codes. Simple and secure.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-cyan-600 rounded-lg p-3 w-fit mb-4">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
              <p className="text-slate-600">
                Your data is encrypted and protected. We follow strict privacy standards to keep student information safe.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="bg-yellow-600 rounded-lg p-3 w-fit mb-4">
                <CheckCircle className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Comprehensive Reports</h3>
              <p className="text-slate-600">
                Generate detailed attendance reports with analytics. Export data in multiple formats for your records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Three simple steps to automated attendance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Register & Enroll</h3>
                <p className="text-slate-600 text-center">
                  Students register with their photo. Teachers create classes and share unique class codes for enrollment.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Capture & Upload</h3>
                <p className="text-slate-600 text-center">
                  Teachers take one photo of the entire class or upload an existing image. AI does the rest automatically.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Auto-Mark & Track</h3>
                <p className="text-slate-600 text-center">
                  AI recognizes faces and marks attendance instantly. View records, analytics, and reports anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose AttendAI?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-green-100 rounded-lg p-3 h-fit">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Save Time</h3>
                    <p className="text-slate-600">Eliminate manual attendance taking. Save up to 30 minutes per class session.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-blue-100 rounded-lg p-3 h-fit">
                    <CheckCircle className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Improve Accuracy</h3>
                    <p className="text-slate-600">99% accurate face recognition eliminates errors and proxy attendance.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-purple-100 rounded-lg p-3 h-fit">
                    <CheckCircle className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Track Trends</h3>
                    <p className="text-slate-600">Identify attendance patterns and address issues proactively with detailed analytics.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-orange-100 rounded-lg p-3 h-fit">
                    <CheckCircle className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Go Paperless</h3>
                    <p className="text-slate-600">Digital records mean no more paper registers. Access everything from anywhere.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 text-center">
              <Camera size={80} className="text-blue-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Ready to Get Started?</h3>
              <p className="text-slate-600 mb-8">
                Join thousands of teachers and students using AttendAI to streamline attendance tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleRoleSelection('teacher')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Start as Teacher
                </button>
                <button
                  onClick={() => handleRoleSelection('student')}
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105"
                >
                  Start as Student
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                  <Camera className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold">AttendAI</span>
              </div>
              <p className="text-slate-400">
                Making attendance tracking simple, accurate, and automated.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 AttendAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}