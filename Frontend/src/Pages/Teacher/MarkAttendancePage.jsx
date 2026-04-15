import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import axios from 'axios'; 
import Spinner from "../Spinner.jsx";

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
  
  // Changed to an array to store multiple images
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
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
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
    if (images.length === 0) return alert("Please add an image first.");
    setLoading(true);
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("classId", classId);
        images.forEach((img, index) => {
          formData.append("groupPhoto", dataURLtoBlob(img.src), `attendance_${index}.jpg`);
        });

        const response = await axios.post(
          "https://ai-powered-real-time-attendence-mon.vercel.app/api/v1/attendance/mark",
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg px-4 py-6">
        <button onClick={handleBackClick} className="flex items-center gap-2 text-white mb-4"><ArrowLeft size={20} /> Back</button>
        <h1 className="text-4xl font-bold text-white">Mark Attendance</h1>
        <p className="text-blue-100">{classData.name} • {classData.students} Students</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          
          {/* Initial State */}
          {!selectedMethod && images.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={startCamera} className="border-2 border-blue-200 rounded-2xl p-8 hover:bg-blue-50 transition-all">
                <Camera className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-center">Use Camera</h3>
              </button>
              <button onClick={() => fileInputRef.current.click()} className="border-2 border-purple-200 rounded-2xl p-8 hover:bg-purple-50 transition-all">
                <Upload className="mx-auto text-purple-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-center">Upload Image</h3>
              </button>
            </div>
          )}

          {/* Camera View */}
          {selectedMethod === 'camera' && (
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
              <div className="flex gap-4 p-4 bg-white">
                <button onClick={() => setSelectedMethod(null)} className="flex-1 py-3 border rounded-lg">Cancel</button>
                <button onClick={capturePhoto} className="flex-1 py-3 bg-blue-600 text-white rounded-lg">Capture</button>
              </div>
            </div>
          )}

          {/* GALLERY PREVIEW WITH PLUS OPTIONS */}
          {images.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Review Images ({images.length})</h2>
                <X className="cursor-pointer text-slate-400" onClick={() => setImages([])} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border">
                    <img src={img.src} alt="Preview" className="w-full h-40 object-cover" />
                    <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><X size={14}/></button>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS (Plus logic) */}
              <div className="grid grid-cols-3 gap-4">
                <button onClick={startCamera} className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg py-3 text-blue-600 hover:bg-blue-50">
                  <Plus size={20}/> <Camera size={20}/> <span className="text-xs">Add Camera</span>
                </button>
                <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-lg py-3 text-purple-600 hover:bg-purple-50">
                  <Plus size={20}/> <Upload size={20}/> <span className="text-xs">Add Upload</span>
                </button>
                <button onClick={handleSubmit} className="col-span-1 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md">
                  Submit All
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
