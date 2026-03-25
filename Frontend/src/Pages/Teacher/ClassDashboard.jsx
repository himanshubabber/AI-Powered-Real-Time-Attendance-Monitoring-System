import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Plus, Users, Calendar, Trash2, ArrowRight, Copy } from 'lucide-react';

function ClassDashboard() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true); // <--- Loading State
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    students: ''
  });
  const [scheduleEntries, setScheduleEntries] = useState([{ day: '', time: '' }]);

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];

  // --- FETCH CLASSES ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const api = axios.create({
          baseURL: "https://ai-powered-real-time-attendence-mon.vercel.app",
          withCredentials: true,
        });

        const response = await api.get("/api/v1/class/my-classes");

        const formattedClasses = response.data.classes.map((cls, index) => ({
          id: cls._id,
          name: cls.className,
          subject: cls.subject,
          
          // 🔥 FIX: Prioritize actual array length over stored number
          students: (cls.students && Array.isArray(cls.students)) 
            ? cls.students.length 
            : (cls.noOfStudents || 0),
            
          schedule: cls.schedule,
          color: colors[index % colors.length],
        }));

        setClasses(formattedClasses);

      } catch (error) {
        console.error("Fetch classes error:", error);
        // We generally don't alert on load errors to keep UI clean, but check console if it fails
      } finally {
        setLoading(false); // <--- Stop loading regardless of success/fail
      }
    };

    fetchClasses();
  }, []);

  // --- CREATE CLASS ---
  const handleCreateClass = async () => {
    try {
      if (!newClass.name || !newClass.subject) {
        alert("Class name and subject are required");
        return;
      }

      const validSchedule = scheduleEntries.filter(s => s.day && s.time);
      if (validSchedule.length === 0) {
        alert("Please add at least one schedule entry");
        return;
      }

      const api = axios.create({
        baseURL: "https://ai-powered-real-time-attendence-mon.vercel.app",
        withCredentials: true,
      });

      const response = await api.post("/api/v1/class/create", {
        className: newClass.name,
        subject: newClass.subject,
        noOfStudents: Number(newClass.students) || 0,
        schedule: validSchedule,
      });

      const createdClass = response.data.class;
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setClasses([
        {
          id: createdClass._id,
          name: createdClass.className,
          subject: createdClass.subject,
          students: createdClass.noOfStudents || 0,
          schedule: createdClass.schedule,
          color: randomColor,
        },
        ...classes,
      ]);

      setNewClass({ name: "", subject: "", students: "" });
      setScheduleEntries([{ day: "", time: "" }]);
      setShowModal(false);

    } catch (error) {
      console.error("Create class error:", error);
      alert(error.response?.data?.message || "Failed to create class");
    }
  };

  // --- SCHEDULE HELPERS ---
  const addScheduleEntry = () => {
    setScheduleEntries([...scheduleEntries, { day: '', time: '' }]);
  };

  const removeScheduleEntry = (index) => {
    if (scheduleEntries.length > 1) {
      setScheduleEntries(scheduleEntries.filter((_, i) => i !== index));
    }
  };

  const updateScheduleEntry = (index, field, value) => {
    const updated = [...scheduleEntries];
    updated[index][field] = value;
    setScheduleEntries(updated);
  };

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (e, cls) => {
    e.stopPropagation();
    setClassToDelete(cls);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const api = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true,
      });

      await api.delete(`/api/v1/class/${classToDelete.id}`);

      // Remove from UI
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setShowDeleteModal(false);
      setClassToDelete(null);

    } catch (error) {
      console.error("Delete class error:", error);
      alert(error.response?.data?.message || "Failed to delete class");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  // --- RENDER LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-medium">Loading classes...</p>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Class Dashboard</h1>
              <p className="text-blue-100">Manage your classes and track attendance effortlessly</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              Create Class
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-2xl font-bold">{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-[340px]"
            >
              <div className={`${cls.color} h-2`}></div>
              <div className="p-6 flex flex-col flex-1">

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {cls.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">{cls.subject}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded select-all">
                        ID: {cls.id}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(cls.id);
                          alert("Class ID copied!");
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="Copy Class ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, cls)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Users size={18} className="text-slate-400" />
                    <span className="text-sm">{cls.students} Students</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-slate-400 mt-0.5" />
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

                <div className="mt-auto">
                  <button
                    onClick={() => navigate(`class/${cls.id}/`)}
                    className="w-full mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 py-2 rounded-lg transition-all group"
                  >
                    View Details
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && classes.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 max-w-md mx-auto">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No classes yet</h3>
              <p className="text-slate-600 mb-6">Create your first class to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Class
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all my-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Class</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class Name</label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Mathematics 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Students</label>
                <input
                  type="number"
                  value={newClass.students}
                  onChange={(e) => setNewClass({...newClass, students: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Class Schedule</label>
                <div className="space-y-3">
                  {scheduleEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={entry.day}
                        onChange={(e) => updateScheduleEntry(index, 'day', e.target.value)}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <input
                        type="text"
                        value={entry.time}
                        onChange={(e) => updateScheduleEntry(index, 'time', e.target.value)}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="e.g., 9-10 AM"
                      />
                      {scheduleEntries.length > 1 && (
                        <button
                          onClick={() => removeScheduleEntry(index)}
                          className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addScheduleEntry}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Another Day
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setScheduleEntries([{ day: '', time: '' }]);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && classToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="text-red-600" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Delete Class?</h2>
            <p className="text-slate-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{classToDelete.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassDashboard;
