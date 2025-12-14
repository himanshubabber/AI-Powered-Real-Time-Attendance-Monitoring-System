import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

export default function StudentClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  // Get data from Redux
  const { rollNo, accessToken } = useSelector((state) => state.studentAuth);

  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Handle "Not Logged In" case
    if (!accessToken || !rollNo) {
        alert("You must be logged in to view class details.");
        navigate('/'); 
        return;
    }

    if (!classId) return;

    const fetchStudentClassData = async () => {
      try {
        setLoading(true);
        const api = axios.create({
          baseURL: "http://localhost:8000",
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // ✅ FIX: Send rollNo as a Query Parameter (?rollNo=...)
        // encodeURIComponent ensures special chars like '/' don't break the URL
        const res = await api.get(
          `/api/v1/student/class/${classId}/attendance/${encodeURIComponent(rollNo)}`
        );

        setClassData(res.data.class);
        console.log(classData)
        setAttendanceRecords(res.data.attendance);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClassData();
  }, [classId, rollNo, accessToken, navigate]);

  const handleBackClick = () => {
    navigate('/student/auth');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculations
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

  const filteredRecords = attendanceRecords.filter(record => 
    filterStatus === 'all' ? true : record.status === filterStatus
  );
  console.log(attendanceRecords)
  console.log(filteredRecords)
  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-slate-600">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-green-600 rounded-full mb-4 animate-bounce"></div>
          Loading class details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button onClick={handleBackClick} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">
          Go Back
        </button>
      </div>
    );
  }

  if (!classData) {
    return <div className="min-h-screen flex items-center justify-center">No class data found.</div>;
  }

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={handleBackClick} className="flex items-center gap-2 text-white hover:text-green-100 mb-4 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to My Classes</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{classData.name}</h1>
            <p className="text-green-100 mb-2">{classData.subject}</p>
            <div className="flex items-center gap-2 text-green-100">
              <Users size={18} />
              <span>{classData.teacher}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3"><Calendar className="text-blue-600" size={24} /></div>
              <div><p className="text-slate-500 text-sm">Total Classes</p><p className="text-2xl font-bold text-slate-900">{totalClasses}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3"><CheckCircle className="text-green-600" size={24} /></div>
              <div><p className="text-slate-500 text-sm">Present</p><p className="text-2xl font-bold text-green-600">{presentCount}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-3"><XCircle className="text-red-600" size={24} /></div>
              <div><p className="text-slate-500 text-sm">Absent</p><p className="text-2xl font-bold text-red-600">{absentCount}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3"><TrendingUp className="text-purple-600" size={24} /></div>
              <div>
                <p className="text-slate-500 text-sm">Attendance</p>
                <p className={`text-2xl font-bold ${Number(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'}`}>{attendancePercentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Class Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classData.schedule?.map((sch, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-lg p-4">
                <Clock className="text-green-600" size={20} />
                <div><p className="font-semibold text-slate-900">{sch.day}</p><p className="text-sm text-slate-600">{sch.time}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Attendance History</h2>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
              <option value="all">All Records</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredRecords.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-6 border-b hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 rounded-lg p-3"><Calendar className="text-slate-600" size={24} /></div>
                  <div><p className="font-semibold text-lg">{formatDate(record.date)}</p><p className="text-sm text-slate-500">{record.day}</p></div>
                </div>
                {record.status === 'present' ? (
                  <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold"><CheckCircle size={20} /> Present</span>
                ) : (
                  <span className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold"><XCircle size={20} /> Absent</span>
                )}
              </div>
            ))}
            {filteredRecords.length === 0 && <div className="text-center py-16 text-slate-500">No records found</div>}
        </div>
      </div>
    </div>
  );
}
