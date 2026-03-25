import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

export default function StudentClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const { rollNo, accessToken } = useSelector((state) => state.studentAuth);

  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

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
          baseURL: "https://ai-powered-real-time-attendence-mon.vercel.app",
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const res = await api.get(
          `/api/v1/student/class/${classId}/attendance/${encodeURIComponent(rollNo)}`
        );

        setClassData(res.data.class);
        setAttendanceRecords(res.data.attendance || []);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClassData();
  }, [classId, rollNo, accessToken, navigate]);


  const handleBackClick = () => navigate('/student/auth');


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // ---- FIXED CALCULATIONS ----

  const totalClasses = attendanceRecords.length;

  const presentCount = attendanceRecords.filter(
    rec => rec?.status?.toLowerCase() === "present"
  ).length;

  const absentCount = attendanceRecords.filter(
    rec => rec?.status?.toLowerCase() === "absent"
  ).length;

  const attendancePercentage =
    totalClasses > 0
      ? ((presentCount / totalClasses) * 100).toFixed(1)
      : 0;


  // ---- FIXED FILTER ----

  const filteredRecords = attendanceRecords.filter(rec =>
    filterStatus === "all"
      ? true
      : rec?.status?.toLowerCase() === filterStatus
  );


  // ---- RENDER STATES ----

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
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No class data found.
      </div>
    );
  }


  // ---- MAIN UI ----

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white hover:text-green-100 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to My Classes</span>
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{classData?.name}</h1>
            <p className="text-green-100 mb-2">{classData?.subject}</p>
            <div className="flex items-center gap-2 text-green-100">
              <Users size={18} />
              <span>{classData?.teacher}</span>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p>Total Classes</p>
            <h2 className="text-2xl font-bold">{totalClasses}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p>Present</p>
            <h2 className="text-2xl font-bold text-green-600">{presentCount}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p>Absent</p>
            <h2 className="text-2xl font-bold text-red-600">{absentCount}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p>Attendance %</p>
            <h2 className={`text-2xl font-bold ${Number(attendancePercentage) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {attendancePercentage}%
            </h2>
          </div>

        </div>


        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Attendance History</h2>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>


        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">

          {filteredRecords.map((rec, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 border-b"
            >
              <div>
                <p className="font-semibold">{formatDate(rec.date)}</p>
              </div>

              {rec?.status?.toLowerCase() === "present" ? (
                <span className="text-green-700 font-semibold flex gap-2 items-center">
                  <CheckCircle size={18} /> Present
                </span>
              ) : (
                <span className="text-red-700 font-semibold flex gap-2 items-center">
                  <XCircle size={18} /> Absent
                </span>
              )}
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No records found
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
