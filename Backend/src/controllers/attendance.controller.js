import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import {Class} from '../models/class.model.js';
import {Attendance} from '../models/attendance.model.js';
import {Student} from '../models/student.model.js';  
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const markAttendance = async (req, res) => {
    try {
        const { classId } = req.body;
         const groupPhotoLocalPath = req.file?.path;

        let groupPhoto;
        if (groupPhotoLocalPath) {
            groupPhoto = await uploadOnCloudinary(groupPhotoLocalPath);
        }
        // 1. Find the Class and populate its Students
        // We need the Face Vectors of everyone in this class
        const targetClass = await Class.findById(classId).populate('students');
        
        if (!targetClass) return res.status(404).json({ msg: "Class not found" });

        // 2. Prepare Data for Python
        const studentsData = targetClass.students.map(s => ({
            roll: s.rollNo,
            vector: s.faceVector
        }));

        // 3. Call Python AI
        const form = new FormData();
        form.append('image', fs.createReadStream(groupPhoto.path));
        form.append('students_data', JSON.stringify(studentsData));

        const aiRes = await axios.post('http://127.0.0.1:5000/check_attendance', form, {
            headers: { ...form.getHeaders() }
        });

        const presentRolls = aiRes.data.present_roll_nos; // e.g., ["207", "230"]

        // 4. Convert Roll Numbers back to Student ObjectIds
        // We filter the class student list to find matching IDs
        const presentStudentIds = targetClass.students
            .filter(s => presentRolls.includes(s.rollNo))
            .map(s => s._id);

        // 5. Create Attendance Record
        const newAttendance =await Attendance.create({
            classId: classId,
            presentStudents: presentStudentIds,
            photoEvidence: groupPhoto ? groupPhoto.url : ''
        });

        const createdAttendance = Attendance.findById(newAttendance._id);

        // 6. Add this Attendance Record to Class History
        targetClass.attendanceHistory.push(createdAttendance._id);
        await targetClass.save();

        res.json({
            success: true,
            presentCount: presentRolls.length,
            presentRolls: presentRolls
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getAttendanceDetail = async (req, res) => {
  try {
    const { classId, date } = req.params;

    // convert date string to Date (YYYY-MM-DD)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // 1️⃣ Fetch class
    const cls = await Class.findById(classId).populate("students", "name rollNo");
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 2️⃣ Fetch attendance for that date
    const attendance = await Attendance.findOne({
      classId,
      date: { $gte: targetDate, $lt: nextDay }
    }).populate("presentStudents", "_id");

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    // 3️⃣ Create lookup for present students
    const presentSet = new Set(
      attendance.presentStudents.map(id => id.toString())
    );

    // 4️⃣ Build final student list
    const students = cls.students.map(student => ({
      id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      status: presentSet.has(student._id.toString())
        ? "present"
        : "absent"
    }));

    const totalStudents = students.length;
    const present = students.filter(s => s.status === "present").length;
    const absent = totalStudents - present;

    res.status(200).json({
      success: true,
      classInfo: {
        name: cls.className,
        subject: cls.subject,
        date,
        totalStudents,
        present,
        absent
      },
      students
    });

  } catch (error) {
    console.error("Attendance detail error:", error);
    res.status(500).json({ message: "Failed to fetch attendance details" });
  }
};

export const getStudentClassAttendance = async (req, res) => {
  try {
    const { classId, rollNo } = req.params;

    const student = await Student.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const cls = await Class.findById(classId)
      .populate("teacher", "name")
      .lean();

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    const attendanceDocs = await Attendance.find({ classId }).sort({ date: -1 });

    const attendance = attendanceDocs.map((att) => ({
      date: att.date.toISOString().split("T")[0],
      day: new Date(att.date).toLocaleDateString("en-US", { weekday: "long" }),
      status: att.presentStudents.includes(student._id)
        ? "present"
        : "absent"
    }));

    res.status(200).json({
      success: true,
      class: {
        _id: cls._id,
        name: cls.className,
        subject: cls.subject,
        teacher: cls.teacher?.name || "N/A",
        schedule: cls.schedule
      },
      attendance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

