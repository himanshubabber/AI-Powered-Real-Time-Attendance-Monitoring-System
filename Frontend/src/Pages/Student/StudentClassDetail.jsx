import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Users, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

export default function StudentClassDetail() {
  const { classId } = useParams();
  const rollNo = useSelector((state) => state.studentAuth.rollNo);
  // Sample class data - you'll pass this from the previous page
  const [classData,setClassData] = useState(null);

  // Sample attendance records - sorted by date (newest first)
  const [attendanceRecords,setAttendanceRecords] = useState([]);

  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'present', 'absent'

  
useEffect(() => {
  if (!rollNo || !classId) return;

  const fetchStudentClassData = async () => {
    try {
      const api = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true
      });

      const res = await api.get(
        `/api/v1/student/class/${classId}/attendance/${rollNo}`
      );

      setClassData(res.data.class);
      setAttendanceRecords(res.data.attendance);

    } catch (error) {
      console.error("Fetch student class error:", error);
      alert("Failed to load class attendance");
    }
  };

  fetchStudentClassData();
}, [classId, rollNo]);

  const handleBackClick = () => {
    console.log('Navigate back to student dashboard');
    // Add your navigation logic here
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calculate statistics
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendancePercentage = ((presentCount / totalClasses) * 100).toFixed(1);

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  return (
  (!classData) ? (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Loading class details...
    </div>
  )
:<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
            <h1 className="text-4xl font-bold text-white mb-2">{classData.name}</h1>
            <p className="text-green-100 mb-2">{classData.subject}</p>
            <div className="flex items-center gap-2 text-green-100">
              <Users size={18} />
              <span>{classData.teacher}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Classes</p>
                <p className="text-2xl font-bold text-slate-900">{totalClasses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-3">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Attendance</p>
                <p className={`text-2xl font-bold ${
                  parseFloat(attendancePercentage) >= 90 ? 'text-green-600' :
                  parseFloat(attendancePercentage) >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {attendancePercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Class Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classData.schedule.map((sch, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-lg p-4">
                <Clock className="text-green-600" size={20} />
                <div>
                  <p className="font-semibold text-slate-900">{sch.day}</p>
                  <p className="text-sm text-slate-600">{sch.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Attendance History</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Records ({totalClasses})</option>
              <option value="present">Present Only ({presentCount})</option>
              <option value="absent">Absent Only ({absentCount})</option>
            </select>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="space-y-0">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className={`flex items-center justify-between p-6 transition-colors hover:bg-slate-50 ${
                  index !== filteredRecords.length - 1 ? 'border-b border-slate-200' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <Calendar className="text-slate-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">{formatDate(record.date)}</p>
                    <p className="text-sm text-slate-500">{record.day}</p>
                  </div>
                </div>

                <div>
                  {record.status === 'present' ? (
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                      <CheckCircle size={20} />
                      Present
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                      <XCircle size={20} />
                      Absent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-16">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No records found</h3>
              <p className="text-slate-600">Try adjusting your filter</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Attendance Tips</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Maintain at least 75% attendance to meet course requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>If you notice any incorrect attendance records, contact your teacher immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Your attendance is automatically marked when you're visible in class photos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}