import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Class } from '../models/class.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Student } from '../models/student.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// -----------------------------------------------------------------------------
// 1. MARK ATTENDANCE (Teacher Side)
// -----------------------------------------------------------------------------
export const markAttendance = async (req, res) => {
    // 1. Get the local file path immediately
    const groupPhotoLocalPath = req.file?.path;

    try {
        const { classId } = req.body;

        if (!groupPhotoLocalPath) {
            return res.status(400).json({ msg: "Photo is required" });
        }

        // 2. Find the Class to get Student Data
        const targetClass = await Class.findById(classId).populate('students');
        if (!targetClass) return res.status(404).json({ msg: "Class not found" });

        const studentsData = targetClass.students.map(s => ({
            roll: s.rollNo,
            vector: s.faceVector
        }));

        // ✅ 3. CALL PYTHON AI FIRST (While the local file still exists)
        const form = new FormData();
        // Use groupPhotoLocalPath (the string path), NOT groupPhoto.path
        form.append('image', fs.createReadStream(groupPhotoLocalPath)); 
        form.append('students_data', JSON.stringify(studentsData));

        //Use port 5001 (or 5000 depending on your Python setup)
        const aiRes = await axios.post('http://127.0.0.1:5001/check_attendance', form, {
            headers: { ...form.getHeaders() }
        });

      //   const aiRes = await axios.post('https://attendaidl.vercel.app/check_attendance', form, {
      //     headers: { ...form.getHeaders() }
      // });

        const presentRolls = aiRes.data.present_roll_nos; // e.g., ["207", "230"]

        // ✅ 4. NOW UPLOAD TO CLOUDINARY
        const groupPhoto = await uploadOnCloudinary(groupPhotoLocalPath);

        // 5. Match Rolls to IDs
        const presentStudentIds = targetClass.students
            .filter(s => presentRolls.includes(s.rollNo))
            .map(s => s._id);

        // 6. Create Attendance Record
        const newAttendance = await Attendance.create({
            classId: classId,
            presentStudents: presentStudentIds,
            photoEvidence: groupPhoto?.url || ''
        });

        // 7. Update Class History
        targetClass.attendanceHistory.push(newAttendance._id);
        await targetClass.save();

        res.json({
            success: true,
            presentCount: presentRolls.length,
            presentRolls: presentRolls
        });

    } catch (err) {
        console.error("Mark Attendance Error:", err);
        // Cleanup: If the file is still there and an error occurred, delete it
        if (groupPhotoLocalPath && fs.existsSync(groupPhotoLocalPath)) {
            fs.unlinkSync(groupPhotoLocalPath);
        }
        res.status(500).json({ error: err.message });
    }
};

// -----------------------------------------------------------------------------
// 2. GET ATTENDANCE DETAILS (Teacher Side - Single Date)
// -----------------------------------------------------------------------------
export const getAttendanceDetail = async (req, res) => {
  try {
    const { classId, date } = req.params;

    console.log(`\n🔍 DEBUG: Fetching Detail for Date: ${date}`);

    // Create Search Range (Start of day to End of day)
    // We append "T00:00:00.000Z" to ensure it's treated as UTC
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    console.log(`📅 DEBUG: Searching DB between: \n   ${startOfDay.toISOString()} \n   ${endOfDay.toISOString()}`);

    // 1️⃣ Fetch class
    const cls = await Class.findById(classId).populate("students", "name rollNo");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // 2️⃣ Fetch attendance
    const attendance = await Attendance.findOne({
      classId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 🚨 DEBUG: If not found, list ALL dates for this class to compare
    if (!attendance) {
        console.log("❌ Attendance NOT found for this range.");
        
        const allRecords = await Attendance.find({ classId }).select('date');
        console.log("👀 DEBUG: Available Dates in DB for this Class:");
        allRecords.forEach(r => console.log(`   - ${r.date.toISOString()}`));

        return res.status(404).json({ message: "Attendance not found" });
    }

    console.log("✅ Attendance Found:", attendance._id);

    // ... (Rest of your code: presentSet, students map, etc.) ...
    
    const presentSet = new Set(attendance.presentStudents.map(id => id.toString()));

    const students = cls.students.map(student => ({
      id: student._id,
      name: student.name,
      rollNo: student.rollNo,
      status: presentSet.has(student._id.toString()) ? "present" : "absent"
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

// 3. GET STUDENT'S ATTENDANCE (Student Side)
// -----------------------------------------------------------------------------
export const getStudentClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { rollNo } = req.query;

    console.log(`\n🔍 DEBUG: Request for Class: ${classId}, Roll: ${rollNo}`);

    if (!rollNo) {
        return res.status(400).json({ message: "Roll Number is required" });
    }

    const student = await Student.findOne({ rollNo });
    if (!student) {
      console.log("❌ DEBUG: Student not found in DB");
      return res.status(404).json({ message: "Student not found" });
    }
    console.log(`✅ DEBUG: Found Student: ${student.name} (${student._id})`);

    const cls = await Class.findById(classId)
      .populate("teacher", "name")
      .lean();

    if (!cls) {
      console.log("❌ DEBUG: Class not found in DB");
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔍 KEY DEBUG STEP: Check raw database results
    const attendanceDocs = await Attendance.find({ classId }).sort({ date: -1 });
    console.log(`📊 DEBUG: Found ${attendanceDocs.length} attendance records for this class.`);

    if (attendanceDocs.length === 0) {
        console.log("⚠️ REASON: The teacher has never marked attendance for this class yet.");
    }

    const attendance = attendanceDocs.map((att) => ({
      date: att.date.toISOString().split("T")[0],
      day: new Date(att.date).toLocaleDateString("en-US", { weekday: "long" }),
      status: att.presentStudents.some(id => id.toString() === student._id.toString())
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
    console.error("Attendance Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};




export const getAttendanceByDate = async (req, res) => {
  try {
    const { classId, date } = req.params;

    // 1. Convert string date (YYYY-MM-DD) to Date object range
    // We search for the record that matches the date part
    const queryDate = new Date(date);
    const nextDay = new Date(date);
    nextDay.setDate(queryDate.getDate() + 1);

    // 2. Fetch the Class (To get ALL enrolled students)
    const classData = await Class.findById(classId).populate('students');
    if (!classData) return res.status(404).json({ message: "Class not found" });

    // 3. Fetch the Attendance Record (To get PRESENT students)
    const attendanceRecord = await Attendance.findOne({
      classId: classId,
      date: {
        $gte: queryDate,
        $lt: nextDay
      }
    }).populate('presentStudents');

    // 4. Logic: Compare All Students vs Present Students
    const allStudents = classData.students || [];
    const presentList = attendanceRecord ? attendanceRecord.presentStudents : [];
    
    // Create a Set of Present IDs for fast lookup
    const presentIds = new Set(presentList.map(s => s._id.toString()));

    // Build final list with Status
    const studentStatusList = allStudents.map(student => {
      // Handle potential nulls if students were deleted
      if (!student) return null; 
      
      const isPresent = presentIds.has(student._id.toString());
      return {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo, // Assuming your Student model has rollNo
        status: isPresent ? "Present" : "Absent"
      };
    }).filter(s => s !== null);

    return res.status(200).json({
      success: true,
      data: {
        date: date,
        totalStudents: allStudents.length,
        presentCount: presentList.length,
        absentCount: allStudents.length - presentList.length,
        attendancePercentage: allStudents.length > 0 
          ? ((presentList.length / allStudents.length) * 100).toFixed(1) 
          : 0,
        students: studentStatusList
      }
    });

  } catch (error) {
    console.error("Get attendance detail error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
