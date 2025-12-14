import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, User, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function TeacherRegister() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async(e) => {
    e.preventDefault();

  try {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);

    if (formData.photo) {
      data.append("profilePhoto", formData.photo); // ✅ must match multer field
    }


    await axios.post(
      "http://localhost:8000/api/v1/teacher/register",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Teacher registered successfully 🎉");

    navigate("/teacher/login");

  } catch (error) {
    console.error("Register error:", error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Registration failed";

    alert(message);
  }
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
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Teacher Account</h1>
          <p className="text-slate-600">Join AttendAI and start managing your classes</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Photo Upload Section - Optional */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Profile Photo <span className="text-slate-400 text-xs">(Optional)</span>
            </label>
            
            {!photoPreview ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 rounded-full p-4 mb-3">
                    <Camera className="text-blue-600" size={32} />
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
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-8">
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
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            type="button"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <GraduationCap size={20} />
            Create Teacher Account
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate("/teacher/login")} className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </button>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">What you can do as a Teacher:</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Create and manage multiple classes with unique codes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Mark attendance automatically using AI face recognition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>View detailed attendance records and generate reports</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Track student participation and attendance trends</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}