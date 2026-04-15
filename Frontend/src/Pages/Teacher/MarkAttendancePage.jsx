import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import axios from 'axios'; 
import Spinner from "../Spinner.jsx";

// Helper: Convert Base64 Image to Blob for uploading
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export default function MarkAttendancePage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  
  // State for multiple images
  const [images, setImages] = useState([]); 
  const [selectedMethod, setSelectedMethod] = useState(null); 
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

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
    setSelectedMethod('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      alert('Unable to access camera.');
      setSelectedMethod(null);
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
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 1.0);
      setImages(prev => [...prev, { id: Date.now(), src: imageData, type: 'Camera' }]);
      stopCamera();
      setSelectedMethod(null);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { id: Date.now() + Math.random(), src: reader.result, type: 'Upload' }]);
      };
      reader.readAsDataURL(file);
    });
    setSelectedMethod(null);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please capture or upload at least one image.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("classId", classId);
        
        // Appending all images to the same key for backend array support
        images.forEach((img, index) => {
          const blob = dataURLtoBlob(img.src);
          formData.append("groupPhoto", blob, `attendance_${index}.jpg`);
        });

        const response = await axios.post(
          "https://ai-powered-real-time-attendence-mon.vercel.app/api/v1/attendance/mark",
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.data.success) {
          alert(`Attendance Marked! \n\n✅ Present: ${response.data.presentCount} students`);
          navigate(`/teacher/auth/class/${classId}/`);
        }
      } catch (error) {
        alert("Failed to mark attendance");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={handleBackClick} className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Class</span>
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Mark Attendance</h1>
          <p className="text-blue-100">{classData.name} • {classData.students} Students</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          
          {/* Main Action Selection */}
          {!selectedMethod && images.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={startCamera} className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 transition-all hover:scale-105">
                <Camera className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 text-center">Use Camera</h3>
              </button>
              <button onClick={() => fileInputRef.current.click()} className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-8 transition-all hover:scale-105">
                <Upload className="mx-auto text-purple-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 text-center">Upload Image</h3>
              </button>
            </div>
          )}

          {/* Camera View */}
          {selectedMethod === 'camera' && (
            <div className="relative bg-slate-900 rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto min-h-[400px]" />
              <div className="flex gap-4 p-6 bg-white border-t">
                <button onClick={() => { stopCamera(); setSelectedMethod(null); }} className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg">Cancel</button>
                <button onClick={capturePhoto} disabled={!isStreaming} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">Capture Photo</button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Multi-Image Review Gallery */}
          {images.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Review Images ({images.length})</h2>
                <div className="flex gap-2">
                   {/* Options to add more images */}
                   <button onClick={startCamera} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1">
                     <Plus size={20}/><Camera size={20}/>
                   </button>
                   <button onClick={() => fileInputRef.current.click()} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all flex items-center gap-1">
                     <Plus size={20}/><Upload size={20}/>
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative bg-slate-100 rounded-lg overflow-hidden border">
                    <img src={img.src} alt="Attendance" className="w-full h-48 object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">{img.type}</div>
                    <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button onClick={handleSubmit} className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95">
                  Submit {images.length} Photos
                </button>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
      {loading && <Spinner />}
    </div>
  );
}
