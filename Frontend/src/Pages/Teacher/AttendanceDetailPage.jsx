import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';

export default function AttendanceDetail() {
  const { classId, date } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('All'); 

  // Format Date for Header and CSV (e.g., "30/12/2025")
  const formattedDateHeader = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  
  // Simpler date format for CSV rows
  const csvDate = new Date(date).toLocaleDateString('en-GB'); 

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const api = axios.create({
          baseURL: "http://localhost:8000",
          withCredentials: true,
        });

        const response = await api.get(`/api/v1/attendance/class/${classId}/date/${date}`);
        setData(response.data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [classId, date]);

  // 🔥 FRONTEND-ONLY EXPORT FUNCTION
  const handleExport = () => {
    if (!data || !data.students) {
      alert("No data to export");
      return;
    }

    const confirmDownload = window.confirm(`Download attendance report for ${csvDate}?`);
    if (!confirmDownload) return;

    // 1. Create CSV Headers
    const headers = ["Roll No,Student Name,Date,Status"];

    // 2. Generate Rows from the existing 'data' state
    const rows = data.students.map(student => {
      // Escape name in quotes just in case it has commas
      return `${student.rollNo},"${student.name}",${csvDate},${student.status}`;
    });

    // 3. Combine Header and Rows with newlines
    const csvContent = [headers, ...rows].join("\n");

    // 4. Create a Blob (File) from the string
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 5. Trigger Download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();

    // 6. Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = data?.students.filter(student => {
    if (filter === 'All') return true;
    return student.status === filter;
  }) || [];

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!data) return <div className="p-10 text-center">Record not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            
            {/* EXPORT BUTTON */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900">{formattedDateHeader}</h1>
          <p className="text-slate-500">Attendance Detail View</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={data.totalStudents} color="bg-blue-50 text-blue-700" />
          <StatCard label="Present" value={data.presentCount} color="bg-green-50 text-green-700" />
          <StatCard label="Absent" value={data.absentCount} color="bg-red-50 text-red-700" />
          <StatCard label="Attendance %" value={`${data.attendancePercentage}%`} color="bg-purple-50 text-purple-700" />
        </div>

        {/* FILTERS & LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            {['All', 'Present', 'Absent'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  filter === f ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Roll No</div>
            <div className="col-span-6">Name</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-3 font-mono text-sm text-slate-600">{student.rollNo || "N/A"}</div>
                  <div className="col-span-6 font-medium text-slate-900">{student.name}</div>
                  <div className="col-span-3 flex justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      student.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status === 'Present' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {student.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No students found for this filter.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <p className="text-xs font-semibold uppercase opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
