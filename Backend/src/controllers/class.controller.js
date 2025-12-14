import { Class } from '../models/class.model.js';
import { Teacher } from '../models/teacher.model.js';
import { Attendance } from '../models/attendance.model.js';

// -----------------------------------------------------------------------------
// 1. CREATE CLASS
// -----------------------------------------------------------------------------
const createClass = async (req, res) => {
  try {
    const { className, subject, noOfStudents, schedule } = req.body;
    const teacherId = req.teacher._id;

    if (!className || !subject) {
      return res.status(400).json({
        success: false,
        message: "Class name and subject are required",
      });
    }

    const newClass = await Class.create({
      className,
      subject,
      teacher: teacherId,
      students: [],               
      schedule: schedule || [],   
      noOfStudents: Number(noOfStudents) || 0,
      attendanceHistory: [],
    });

    // Add class ID to teacher's classes array
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

// -----------------------------------------------------------------------------
// 2. GET ALL CLASSES (For Dashboard)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// 3. GET CLASS DETAILS (For Detail Page Graphs)
// -----------------------------------------------------------------------------
const getClassById = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacher._id;

    // 1. Find the Class
    const classData = await Class.findOne({
      _id: classId,
      teacher: teacherId, // Security check
    });

    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // 2. Fetch Attendance Records manually to calculate stats
    const attendanceLogs = await Attendance.find({ classId }).sort({ date: -1 });

    const totalStudents = classData.students.length || classData.noOfStudents || 0;

    // 3. Calculate Stats for Frontend
    const history = attendanceLogs.map((log) => {
      const presentCount = log.presentStudents.length;
      const absentCount = Math.max(0, totalStudents - presentCount);
      
      const percentage = totalStudents === 0 
        ? 0 
        : ((presentCount / totalStudents) * 100).toFixed(1);

      return {
        _id: log._id,
        date: log.date,
        presentCount,
        absentCount,
        attendancePercentage: Number(percentage)
      };
    });

    // 4. Send combined data
    const payload = {
      ...classData.toObject(),
      attendanceHistory: history // Override with calculated data
    };

    return res.status(200).json({
      success: true,
      class: payload,
    });

  } catch (error) {
    console.error("Get class detail error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -----------------------------------------------------------------------------
// 4. DELETE CLASS (New!)
// -----------------------------------------------------------------------------
const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.teacher._id;

    // 1. Delete the Class document
    const deletedClass = await Class.findOneAndDelete({
      _id: classId,
      teacher: teacherId // Security: ensure ownership
    });

    if (!deletedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // 2. Remove Class ID from Teacher's list
    await Teacher.findByIdAndUpdate(teacherId, {
      $pull: { classes: classId }
    });

    // 3. (Optional) Delete associated attendance records
    await Attendance.deleteMany({ classId: classId });

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully"
    });

  } catch (error) {
    console.error("Delete class error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete class"
    });
  }
};

export {
    createClass,
    getMyClasses,
    getClassById,
    deleteClass 
};
