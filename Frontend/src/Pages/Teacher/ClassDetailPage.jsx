import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Users, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  
  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const api = axios.create({
          baseURL: "http://localhost:8000",
          withCredentials: true,
        });

        const response = await api.get(`/api/v1/class/${classId}`);
        const cls = response.data.class;

        // 🔥 LOGIC FIX: Check if 'students' array exists to get the REAL count
        const realStudentCount = (cls.students && Array.isArray(cls.students)) 
          ? cls.students.length 
          : (cls.noOfStudents || 0);

        // 1️⃣ Set Class Data
        setClassData({
          id: cls._id,
          name: cls.className,
          subject: cls.subject,
          students: realStudentCount, // Use the calculated real count
          schedule: cls.schedule || [],
        });

        // 2️⃣ Set Attendance History
        const records = (cls.attendanceHistory || []).map((att) => ({
          date: att.date,
          present: att.presentCount,
          absent: att.absentCount,
          percentage: att.attendancePercentage,
        }));

        setAttendanceRecords(records);

      } catch (error) {
        console.error("Fetch class detail error:", error);
        // Optional: Redirect back if class not found
        // navigate("/teacher/auth/");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

  // --- NAVIGATION HANDLERS ---
  
  const handleBackClick = () => {
    navigate("/teacher/auth/");
  };

  const handleMarkAttendance = () => {
    // Navigate to the marking page for this class
    navigate(`/teacher/auth/class/${classId}/mark-attendance`);
  };

  const handleDateClick = (dateString) => {
    // Format date to YYYY-MM-DD for the URL
    const dateObj = new Date(dateString);
    const simpleDate = dateObj.toISOString().split('T')[0];
    
    // Navigate to the specific day view
    navigate(`/teacher/auth/class/${classId}/attendance/${simpleDate}`);
  };

  // --- HELPER FUNCTIONS ---

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const averageAttendance = attendanceRecords.length > 0
    ? (attendanceRecords.reduce((sum, record) => sum + record.percentage, 0) / attendanceRecords.length).toFixed(1)
    : 0;

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 text-lg animate-pulse">Loading class details...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-600 text-lg">Class not found.</p>
        <button onClick={handleBackClick} className="text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Classes</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{classData.name}</h1>
              <p className="text-blue-100">{classData.subject}</p>
            </div>
            <button
              onClick={handleMarkAttendance}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <CheckCircle size={20} />
              Mark Today's Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Class Info & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{classData.students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Average Attendance</p>
                <p className="text-2xl font-bold text-slate-900">{averageAttendance}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{attendanceRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg p-3">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Schedule</p>
                <p className="text-sm font-semibold text-slate-900">
                  {classData.schedule.length} days/week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Class Schedule</h2>
          {classData.schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.schedule.map((sch, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-lg p-4">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <p className="font-semibold text-slate-900">{sch.day}</p>
                    <p className="text-sm text-slate-600">{sch.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No schedule set.</p>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Attendance History</h2>
          
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Attendance Records</h3>
              <p className="text-slate-600 mb-6">Start by marking today's attendance</p>
              <button
                onClick={handleMarkAttendance}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Mark Attendance
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.map((record, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(record.date)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 group-hover:bg-blue-100 rounded-lg p-3 transition-colors">
                      <Calendar className="text-slate-600 group-hover:text-blue-600 transition-colors" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{formatDate(record.date)}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="text-green-600 font-medium">{record.present} Present</span>
                        {' • '}
                        <span className="text-red-600 font-medium">{record.absent} Absent</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{record.percentage}%</p>
                      <p className="text-sm text-slate-500">Attendance</p>
                    </div>
                    <div className="flex gap-2">
                      {record.percentage >= 90 ? (
                        <CheckCircle className="text-green-500" size={24} />
                      ) : record.percentage >= 75 ? (
                        <CheckCircle className="text-yellow-500" size={24} />
                      ) : (
                        <XCircle className="text-red-500" size={24} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
