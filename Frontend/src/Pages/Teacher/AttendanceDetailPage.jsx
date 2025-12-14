import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
} from "lucide-react";

export default function AttendanceDetailPage() {
  const { classId, date } = useParams();
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  /* ===========================
     Load jsPDF
  ============================ */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.head.appendChild(script);

    return () => document.head.removeChild(script);
  }, []);

  /* ===========================
     Fetch attendance from backend
  ============================ */
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const api = axios.create({
          baseURL: "http://localhost:8000",
          withCredentials: true,
        });

        const res = await api.get(
          `/api/v1/teacher/class/${classId}/attendance/${date}`
        );

        setAttendanceData(res.data);
      } catch (error) {
        console.error("Attendance fetch error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to load attendance data"
        );
      }
    };

    fetchAttendance();
  }, [classId, date]);

  /* ===========================
     Helper functions
  ============================ */
  const handleBackClick = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExport = () => {
    if (!window.jspdf) {
      alert("PDF library still loading...");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const { classInfo, students } = attendanceData;

    doc.setFontSize(18);
    doc.text(classInfo.name, 105, 15, { align: "center" });

    doc.setFontSize(11);
    doc.text(classInfo.subject, 105, 23, { align: "center" });
    doc.text(formatDate(classInfo.date), 105, 29, { align: "center" });

    let y = 45;
    students.forEach((s) => {
      doc.text(`${s.rollNo}`, 20, y);
      doc.text(`${s.name}`, 50, y);
      doc.text(`${s.status}`, 150, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(
      `Attendance_${classInfo.name}_${classInfo.date}.pdf`
    );
  };

  /* ===========================
     Loading state
  ============================ */
  if (!attendanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading attendance details...
      </div>
    );
  }

  /* ===========================
     Filter logic
  ============================ */
  const filteredStudents = attendanceData.students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || s.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const { classInfo } = attendanceData;

  /* ===========================
     UI
  ============================ */
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {classInfo.name}
              </h1>
              <p className="text-blue-100">
                {formatDate(classInfo.date)}
              </p>
            </div>

            <button
              onClick={handleExport}
              className="bg-white text-blue-600 px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Students"
          value={classInfo.totalStudents}
          icon={<Calendar />}
        />
        <StatCard
          label="Present"
          value={classInfo.present}
          icon={<CheckCircle />}
          color="text-green-600"
        />
        <StatCard
          label="Absent"
          value={classInfo.absent}
          icon={<XCircle />}
          color="text-red-600"
        />
        <StatCard
          label="Attendance %"
          value={`${(
            (classInfo.present / classInfo.totalStudents) *
            100
          ).toFixed(1)}%`}
          icon={<CheckCircle />}
          color="text-purple-600"
        />
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student..."
            className="w-full pl-10 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4"
        >
          <option value="all">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <table className="w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Roll No</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-4">{s.rollNo}</td>
                <td className="p-4">{s.name}</td>
                <td className="p-4">
                  {s.status === "present" ? (
                    <span className="text-green-600 font-semibold">
                      Present
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Absent
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <p className="text-center mt-6 text-slate-500">
            No students found
          </p>
        )}
      </div>
    </div>
  );
}

/* ===========================
   Small reusable stat card
============================ */
function StatCard({ label, value, icon, color = "text-slate-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
