import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Users, Calendar, TrendingUp, ArrowRight, X, LogOut } from 'lucide-react';
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearStudentDetails } from '../../store/studentAuthSlice.js';
import { useSelector } from 'react-redux';
// adjust path if needed


export default function StudentDashboard() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');

  // Sample student data


  // Sample enrolled classes
  const [enrolledClasses, setEnrolledClasses] = useState([]);

  const studentInfo = useSelector((state) => ({
  name: state.studentAuth.name,
  rollNo: state.studentAuth.rollNo,
  photo: state.studentAuth.photo,
}));

  useEffect(() => {
  const fetchEnrolledClasses = async () => {
    try {
      const api = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true,
      });

      const res = await api.get("/api/v1/student/my-classes");

      // normalize backend data → UI format
      const formattedClasses = res.data.classes.map((cls) => ({
        id: cls._id,
        name: cls.className,
        subject: cls.subject,
        teacher: cls.teacherName,
        schedule: cls.schedule,
        attendance: cls.attendance,
        totalClasses: cls.totalClasses,
        attended: cls.attended,
        color: "bg-green-500", // optional / static
      }));

      setEnrolledClasses(formattedClasses);

    } catch (error) {
      console.error("Fetch classes error:", error);
      alert("Failed to load enrolled classes");
    }
  };

  fetchEnrolledClasses();
}, []);


  const handleLogout = async () => {
  try {
    const api = axios.create({
      baseURL: "http://localhost:8000",
      withCredentials: true
    });

    await api.post("/api/v1/student/logout");

    // 🔥 Clear redux state
    dispatch(clearStudentDetails());

    // 🔥 Redirect to login page
    navigate("/student/");

  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout failed. Please try again.");
  }
};


 const handleJoinClass = async () => {
  if (!classCode.trim()) {
    alert("Please enter a valid class code");
    return;
  }

  try {
    const api = axios.create({
      baseURL: "http://localhost:8000",
      withCredentials: true
    });

    const response = await api.post(
      "/api/v1/student/join-class",
      {
        classId: classCode   // 👈 classCode IS class._id
      }
    );

    alert("Successfully joined the class!");

    // OPTIONAL: add newly joined class to UI
    if (response.data?.class) {
      setEnrolledClasses((prev) => [response.data.class, ...prev]);
    }

    setClassCode("");
    setShowJoinModal(false);

  } catch (error) {
    console.error("Join class error:", error);
    alert(
      error.response?.data?.message ||
      "Failed to join class"
    );
  }
};



  const handleClassClick = (classId) => {
    navigate(`class/${classId}/`)
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const overallAttendance = enrolledClasses.length > 0
    ? (enrolledClasses.reduce((sum, cls) => sum + cls.attendance, 0) / enrolledClasses.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {studentInfo.name}!</h1>
              <p className="text-green-100">Student ID: {studentInfo.studentId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={20} />
                Join Class
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-3 rounded-xl font-semibold transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-3">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Enrolled Classes</p>
                <p className="text-2xl font-bold text-slate-900">{enrolledClasses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Overall Attendance</p>
                <p className="text-2xl font-bold text-green-600">{overallAttendance}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Classes Attended</p>
                <p className="text-2xl font-bold text-slate-900">
                  {enrolledClasses.reduce((sum, cls) => sum + cls.attended, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-3">
                <X className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Classes Missed</p>
                <p className="text-2xl font-bold text-red-600">
                  {enrolledClasses.reduce((sum, cls) => sum + (cls.totalClasses - cls.attended), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Classes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Classes</h2>

          {enrolledClasses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Classes Yet</h3>
              <p className="text-slate-600 mb-6">Join your first class using a class code from your teacher</p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Join a Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col"
                >
                  <div className={`${cls.color} h-2`}></div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        {cls.name}
                      </h3>
                      <p className="text-slate-500 text-sm">{cls.subject}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm">{cls.teacher}</span>
                      </div>
                      
                      <div className="min-h-[60px]">
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            {cls.schedule.map((sch, idx) => (
                              <div key={idx} className="text-sm text-slate-600">
                                <span className="font-medium">{sch.day}:</span> {sch.time}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className={`${getAttendanceBgColor(cls.attendance)} rounded-lg p-4 mb-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Attendance</span>
                        <span className={`text-lg font-bold ${getAttendanceColor(cls.attendance)}`}>
                          {cls.attendance}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {cls.attended} of {cls.totalClasses} classes attended
                      </div>
                      <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${cls.attendance >= 90 ? 'bg-green-500' : cls.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${cls.attendance}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClassClick(cls.id)}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group mt-auto"
                    >
                      View Details
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Make sure you're visible in class photos for accurate attendance marking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Check your attendance regularly to stay on track</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Contact your teacher if you notice any attendance discrepancies</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all border-2 border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Join a Class</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setClassCode('');
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-600 mb-6">
              Enter the class code provided by your teacher to join the class.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Class Code
              </label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g., MATH101ABC"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-lg font-mono tracking-wider uppercase"
                maxLength={12}
              />
              <p className="text-xs text-slate-500 mt-2">
                Class codes are usually 6-12 characters long
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setClassCode('');
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClass}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-green-500/30"
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