import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, User, Mail, Lock, Phone, Hash, Image, Eye, EyeOff } from 'lucide-react';

export default function StudentRegister() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    phoneNo: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleBackClick = () => {
    navigate("/student/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photo: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFormData({
      ...formData,
      photo: null
    });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // basic validation
  if (!formData.name || !formData.email || !formData.password || !formData.rollNo || !formData.photo) {
    alert("Please fill all required fields and upload a photo");
    return;
  }

  try {
    const api =  axios.create({
      baseURL: "http://localhost:8000",
      withCredentials: true,
    });

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("rollNo", formData.rollNo);
    data.append("phoneNo", formData.phoneNo);
    data.append("profilePhoto", formData.photo);

    await api.post(
      "/api/v1/student/register",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Registration successful 🎉");
    navigate("/student/login");

  } catch (error) {
    console.error("Student register error:", error);
    alert(
      error.response?.data?.message ||
      "Registration failed. Please try again."
    );
  }
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
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4">
            <User className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-slate-600">Register to start tracking your attendance</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Photo Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            
            {!photoPreview ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 rounded-full p-4 mb-3">
                    <Camera className="text-green-600" size={32} />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">Upload your photo</p>
                  <p className="text-sm text-slate-500">Click to browse or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="flex-1 px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-slate-500 mt-2">
              This photo will be used for face recognition during attendance
            </p>
          </div>

          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
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
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Create a strong password"
                className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>

          {/* Roll Number Field */}
          <div className="mb-6">
            <label htmlFor="rollNo" className="block text-sm font-semibold text-slate-700 mb-2">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2024001"
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="mb-8">
            <label htmlFor="phoneNo" className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="tel"
                id="phoneNo"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            type="button"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <User size={20} />
            Create Account
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate("/student/login")} className="cursor-pointer text-green-600 hover:text-green-700 font-semibold">
              Login here
            </button>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Why we need your photo?</h3>
          <p className="text-sm text-slate-700">
            Your photo is used for AI-powered face recognition to automatically mark your attendance when your teacher takes class photos. This ensures accurate and hassle-free attendance tracking.
          </p>
        </div>
      </div>
    </div>
  );
}