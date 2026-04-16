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

  // --- 1. DATE FORMATTING ---
  const formattedDateHeader = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const csvDate = new Date(date).toLocaleDateString('en-GB'); 

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const api = axios.create({
          baseURL: "https://ai-powered-real-time-attendence-mon.vercel.app",
          withCredentials: true,
        });

        const response = await api.get(`/api/v1/attendance/class/${classId}/date/${date}`);
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [classId, date]);

  // --- 3. DEDUPLICATION LOGIC (The "Source of Truth") ---
  const getProcessedData = () => {
    if (!data || !data.students) return { students: [], total: 0, present: 0, absent: 0, pct: 0 };

    // Use a Map to force uniqueness by Roll Number
    const uniqueMap = new Map();
    
    data.students.forEach(student => {
      const roll = (student.rollNo || "").toString().trim();
      if (!roll) return;

      // Priority Logic: If a student exists twice, 'Present' overwrites 'Absent'
      if (!uniqueMap.has(roll) || student.status === 'Present') {
        uniqueMap.set(roll, student);
      }
    });

    const uniqueList = Array.from(uniqueMap.values());
    const total = uniqueList.length;
    const present = uniqueList.filter(s => s.status === 'Present').length;
    const absent = Math.max(0, total - present);
    const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";

    return { 
      students: uniqueList, 
      total, 
      present, 
      absent, 
      pct 
    };
  };

  const { students: uniqueStudents, total, present, absent, pct } = getProcessedData();

  // --- 4. EXPORT LOGIC ---
  const handleExport = () => {
    if (uniqueStudents.length === 0) {
      alert("No data to export");
      return;
    }

    const confirmDownload = window.confirm(`Download attendance report for ${csvDate}?`);
    if (!confirmDownload) return;

    const headers = ["Roll No,Student Name,Date,Status"];
    const rows = uniqueStudents.map(student => {
      return `${student.rollNo},"${student.name}",${csvDate},${student.status}`;
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- 5. FILTERING LOGIC ---
  const filteredStudents = uniqueStudents.filter(student => {
    if (filter === 'All') return true;
    return student.status === filter;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Record not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- STICKY HEADER --- */}
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
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{formattedDateHeader}</h1>
          <p className="text-slate-500">Class Attendance Report</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={total} color="bg-blue-50 text-blue-700" />
          <StatCard label="Present" value={present} color="bg-green-50 text-green-700" />
          <StatCard label="Absent" value={absent} color="bg-red-50 text-red-700" />
          <StatCard label="Attendance %" value={`${pct}%`} color="bg-purple-50 text-purple-700" />
        </div>

        {/* --- FILTER TABS --- */}
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
                {f} ({f === 'All' ? total : f === 'Present' ? present : absent})
              </button>
            ))}
          </div>

          {/* --- TABLE HEADER --- */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3 font-bold">Roll No</div>
            <div className="col-span-6 font-bold">Student Name</div>
            <div className="col-span-3 text-right font-bold">Status</div>
          </div>

          {/* --- STUDENT LIST --- */}
          <div className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div key={student.rollNo} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-3 font-mono text-sm text-slate-600">{student.rollNo}</div>
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
              <div className="p-12 text-center text-slate-500 italic">
                No records found for this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ label, value, color }) {
  return (
    <div className={`p-5 rounded-2xl shadow-sm border border-black/5 ${color}`}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );
}
