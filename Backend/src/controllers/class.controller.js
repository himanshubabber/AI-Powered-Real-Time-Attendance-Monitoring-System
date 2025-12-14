import { Class } from '../models/class.model.js';
import { Teacher } from '../models/teacher.model.js';
import { Attendance } from '../models/attendance.model.js';

const createClass = async (req, res) => {
  try {
    const { className, subject, noOfStudents, schedule } = req.body;
    const teacherId = req.teacher._id;

    // basic validation
    if (!className || !subject) {
      return res.status(400).json({
        success: false,
        message: "Class name and subject are required",
      });
    }

    // 1. Create the class
    const newClass = await Class.create({
      className,
      subject,
      teacher: teacherId,
      students: [],               // will be filled later
      schedule: schedule || [],   // 👈 schedule support
      noOfStudents: noOfStudents || 0, // optional field
      attendanceHistory: [],
    });

    // 2. Add class ID to teacher's classes array
    await Teacher.findByIdAndUpdate(
      teacherId,
      { $push: { classes: newClass._id } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      class: newClass,
      message: "Class created successfully",
    });

  } catch (err) {
    console.error("Create class error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.teacher._id;

    const classes = await Class.find({ teacher: teacherId })
      .select("className subject noOfStudents schedule")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      classes,
    });

  } catch (error) {
    console.error("Fetch classes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacher._id;

    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId, // 🔐 security: only owner teacher
    })
      .select("className subject noOfStudents schedule attendanceHistory")
      .populate("attendanceHistory");

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      class: classData,
    });

  } catch (error) {
    console.error("Get class detail error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
    createClass,
    getMyClasses,
    getClassById
}