import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Users, Calendar, TrendingUp, ArrowRight, X, LogOut, CheckCircle, XCircle } from 'lucide-react';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { clearStudentDetails } from '../../store/studentAuthSlice.js';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Robust Redux Data Access
  const authState = useSelector((state) => state.studentAuth);
  // Handle nested student object if present, or direct properties
  const student = authState.student || authState;
  const accessToken = authState.accessToken;
  const name = student?.name || "Student";
  const rollNo = student?.rollNo || student?.roll || "N/A";

  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(true);

  // ================= Fetch Classes =================
  useEffect(() => {
    if (!accessToken) return;

    const fetchEnrolledClasses = async () => {
      try {
        const api = axios.create({
          baseURL: "https://ai-powered-real-time-attendence-mon.vercel.app/api/v1/teacher/register",
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const res = await api.get("/api/v1/student/my-classes");

        // 🔥 FIX: Map backend data accurately to numbers
        const formatted = res.data.classes.map(cls => ({
          id: cls._id,
          name: cls.className,
          subject: cls.subject,
          teacher: cls.teacherName || "Unknown Teacher",
          schedule: cls.schedule || [],
          
          // Ensure these are Numbers for calculation
          attendance: Number(cls.attendance || 0),     // Percentage from backend
          totalClasses: Number(cls.totalClasses || 0), // Total sessions
          attended: Number(cls.attended || 0),         // Sessions present
          
          color: "bg-green-500" // You can randomize this if needed
        }));

        setEnrolledClasses(formatted);
      } catch (err) {
        console.error("Fetch classes failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [accessToken]);

  // ================= Logout =================
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/v1/student/logout", {}, { 
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (_) {}
    dispatch(clearStudentDetails());
    navigate("/student/");
  };

  // ================= Join Class =================
  const handleJoinClass = async () => {
    if (!classCode.trim()) return alert("Enter valid class code");

    try {
      const api = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const res = await api.post("/api/v1/student/join-class", {
        classId: classCode.trim()
      });

      alert("Joined successfully");

      // Add new class to state immediately
      if (res.data?.class) {
        const c = res.data.class;
        const newClass = {
          id: c.id || c._id, // Handle both id formats
          name: c.name || c.className,
          subject: c.subject,
          teacher: c.teacher || "Teacher",
          schedule: c.schedule || [],
          attendance: 0,
          totalClasses: 0,
          attended: 0,
          color: "bg-green-500"
        };
        setEnrolledClasses(prev => [newClass, ...prev]);
      }

      setClassCode("");
      setShowJoinModal(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  // ================= Helper: Stats Calculation =================
  
  // 1. Total Classes Held (Sum of all classes' total sessions)
  const totalClassesHeld = enrolledClasses.reduce((sum, cls) => sum + cls.totalClasses, 0);

  // 2. Total Classes Attended (Sum of all classes' present count)
  const totalClassesAttended = enrolledClasses.reduce((sum, cls) => sum + cls.attended, 0);

  // 3. Classes Missed
  const totalClassesMissed = totalClassesHeld - totalClassesAttended;

  // 4. Overall Attendance % (Weighted Average)
  // Logic: (Total Attended / Total Held) * 100
  const overallAttendancePercent = totalClassesHeld === 0 
    ? "0.0" 
    : ((totalClassesAttended / totalClassesHeld) * 100).toFixed(1);


  // ================= Helper: UI Colors =================
  const getAttendanceColor = p => {
    p = Number(p);
    if (p >= 90) return "text-green-600";
    if (p >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceBg = p => {
    p = Number(p);
    if (p >= 90) return "bg-green-100";
    if (p >= 75) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getProgressBarColor = p => {
    p = Number(p);
    if (p >= 90) return "bg-green-500";
    if (p >= 75) return "bg-yellow-500";
    return "bg-red-500";
  }

  // ================= Loader =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome, {name}</h1>
              <div className="flex items-center gap-2 mt-2 text-green-100 bg-white/10 px-3 py-1 rounded-full w-fit">
                <span className="text-sm font-medium">Roll No: {rollNo}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:bg-green-50 transition-all"
              >
                <Plus size={18} /> Join Class
              </button>

              <button
                onClick={handleLogout}
                className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <StatCard 
            icon={<BookOpen size={24} className="text-blue-600" />}
            bg="bg-blue-50"
            label="Enrolled Classes"
            value={enrolledClasses.length}
          />

          <StatCard 
            icon={<TrendingUp size={24} className={getAttendanceColor(overallAttendancePercent)} />}
            bg={getAttendanceBg(overallAttendancePercent)}
            label="Overall Attendance"
            value={`${overallAttendancePercent}%`}
            textColor={getAttendanceColor(overallAttendancePercent)}
          />

          <StatCard 
            icon={<CheckCircle size={24} className="text-emerald-600" />}
            bg="bg-emerald-50"
            label="Classes Attended"
            value={totalClassesAttended}
            subtext={`out of ${totalClassesHeld}`}
          />

          <StatCard 
            icon={<XCircle size={24} className="text-red-600" />}
            bg="bg-red-50"
            label="Classes Missed"
            value={totalClassesMissed}
            textColor="text-red-600"
          />

        </div>

        {/* --- CLASS LIST --- */}
        {enrolledClasses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No classes enrolled</h3>
            <p className="text-slate-500 mt-2">Join a class to start tracking your attendance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledClasses.map(cls => (
              <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
                
                {/* Colored Top Bar */}
                <div className={`h-2 w-full ${cls.color}`}></div>

                <div className="p-6 flex flex-col flex-1">
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{cls.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{cls.subject}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 bg-slate-50 p-2 rounded-lg w-fit">
                    <Users size={16} />
                    <span>{cls.teacher}</span>
                  </div>

                  {/* Attendance Bar Section */}
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase">Attendance</span>
                        <div className={`text-2xl font-bold ${getAttendanceColor(cls.attendance)}`}>
                          {cls.attendance}%
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 font-medium">
                        {cls.attended} / {cls.totalClasses} Sessions
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(cls.attendance)}`}
                        style={{ width: `${cls.attendance}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`class/${cls.id}/`)}
                    className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors group-hover:bg-green-50 group-hover:text-green-700"
                  >
                    View History <ArrowRight size={16} />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ================= JOIN CLASS MODAL ================= */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Join a Class</h2>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-4">
              Ask your teacher for the unique Class Code (ID) to enroll.
            </p>

            <div className="space-y-4">
              <input
                value={classCode}
                onChange={e => setClassCode(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-lg focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                placeholder="Paste Class Code here..."
              />

              <button
                onClick={handleJoinClass}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
              >
                Join Class
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Simple Reusable Stat Card Component
function StatCard({ icon, bg, label, value, subtext, textColor = "text-slate-800" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <h2 className={`text-3xl font-bold ${textColor}`}>{value}</h2>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
