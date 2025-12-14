import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Image } from 'lucide-react';

export default function MarkAttendancePage() {
  const navigate= useNavigate();
  const { classId } = useParams();
  const [selectedMethod, setSelectedMethod] = useState(null); // 'camera' or 'upload'
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample class data - you'll pass this from the previous page
  const classData = {
    name: 'Mathematics 101',
    subject: 'Mathematics',
    students: 32
  };

  const handleBackClick = () => {
    stopCamera();
    navigate(`/teacher/auth/class/${classId}/`);
  };

  const startCamera = async () => {
    console.log('Starting camera...');
    setSelectedMethod('camera');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream attached to video element');
        
        // Force video to play and set streaming to true
        await videoRef.current.play();
        console.log('Video playing');
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Error: ' + error.message);
      setSelectedMethod(null);
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (event) => {
    console.log('File upload triggered', event.target.files);
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      setSelectedMethod('upload');
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('File read complete');
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setCapturedImage(null);
    setSelectedMethod(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // const chooseDifferentUpload = () => {
  //   // Don't clear the current image yet, just trigger file input
  //   triggerFileInput();
  // };

  const handleSubmit = () => {
    const imageToSubmit = capturedImage || uploadedImage;
    //IT WILL WRITTEN BY HIMANSHU





    navigate(`/teacher/auth/class/${classId}/`);

  };

  const currentImage = capturedImage || uploadedImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Class</span>
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mark Attendance</h1>
            <p className="text-blue-100">{classData.name} • {classData.students} Students</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {!selectedMethod && !capturedImage && !uploadedImage && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Choose Attendance Method</h2>
              <p className="text-slate-600 text-center mb-8">Select how you want to mark attendance for today</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Camera Option */}
                <button
                  onClick={startCamera}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-8 transition-all transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500 group-hover:bg-blue-600 rounded-full p-6 mb-4 transition-colors">
                      <Camera className="text-white" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Use Camera</h3>
                    <p className="text-slate-600 text-center">Take a photo of the class using your camera</p>
                  </div>
                </button>

                {/* Upload Option */}
                <button
                  onClick={triggerFileInput}
                  className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-8 transition-all transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-500 group-hover:bg-purple-600 rounded-full p-6 mb-4 transition-colors">
                      <Upload className="text-white" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Image</h3>
                    <p className="text-slate-600 text-center">Upload a pre-taken photo from your device</p>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Camera View */}
          {selectedMethod === 'camera' && !capturedImage && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Position Camera</h2>
              
              <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center text-center py-12 z-10">
                    <div>
                      <Camera size={48} className="mx-auto text-slate-400 mb-4 animate-pulse" />
                      <p className="text-slate-300 mb-4">Starting camera...</p>
                      <p className="text-sm text-slate-400">Please allow camera access when prompted</p>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ minHeight: '400px', display: 'block' }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    stopCamera();
                    setSelectedMethod(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {(capturedImage || uploadedImage) && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Review Image</h2>
                <button
                  onClick={() => {
                    if (capturedImage) {
                      setCapturedImage(null);
                      setSelectedMethod(null);
                    } else {
                      removeUploadedImage();
                    }
                  }}
                  type="button"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all z-20"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-6 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '600px' }}>
                <img
                  src={currentImage}
                  alt="Attendance"
                  className="max-w-full max-h-[600px] w-auto h-auto object-contain"
                />
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 z-10">
                  <div className="flex items-center gap-2">
                    <Image className="text-blue-600" size={20} />
                    <span className="font-semibold text-slate-900">
                      {selectedMethod === 'camera' ? 'Camera Photo' : 'Uploaded Image'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 relative z-20">
                {capturedImage ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      retakePhoto();
                    }}
                    type="button"
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Retake Photo
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('Opening file picker...');
                        console.log('File input ref:', fileInputRef.current);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                          setTimeout(() => {
                            fileInputRef.current.click();
                            console.log('File input clicked');
                          }, 100);
                        }
                      }}
                      type="button"
                      className="flex-1 px-6 py-3 border-2 border-blue-500 text-blue-700 bg-blue-50 rounded-lg font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Choose Different Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      key={Date.now()}
                    />
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  type="button"
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg cursor-pointer"
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Make sure all students are visible in the frame for accurate attendance marking.
          </p>
        </div>
      </div>
    </div>
  );
}