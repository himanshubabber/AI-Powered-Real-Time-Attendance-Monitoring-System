import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import {Student} from '../models/student.model.js';
import {Class} from '../models/class.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Attendance } from '../models/attendance.model.js';

const generateAccessAndRefreshTokens = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    const accessToken = student.generateAccessToken();
    const refreshToken = student.generateRefreshToken();
    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerStudent = async (req, res) => {
  const studentPhotoLocalPath = req.file?.path; // Define outside try block for cleanup access

  try {
    const { name, rollNo, email, password, phoneNo } = req.body;

    if (!studentPhotoLocalPath) {
      return res.status(400).json({ message: "Photo is required" });
    }

    // ✅ 1. CALL PYTHON FIRST
    const form = new FormData();
    form.append("image", fs.createReadStream(studentPhotoLocalPath));

    // Calling Python on Port 5001 (Correct!)
    const aiRes = await axios.post(
      "http://127.0.0.1:5001/get_embedding", 
      form,
      { headers: form.getHeaders() }
    );

    if (!aiRes.data.success) {
      // ⚠️ CLEANUP: Delete file if face not detected
      if (fs.existsSync(studentPhotoLocalPath)) fs.unlinkSync(studentPhotoLocalPath);
      throw new Error("Face not detected in image");
    }

    // ✅ 2. THEN UPLOAD TO CLOUDINARY
    const studentPhoto = await uploadOnCloudinary(studentPhotoLocalPath);

    // ✅ 3. CREATE STUDENT
    const student = await Student.create({
      name,
      rollNo,
      email,
      phoneNo,
      password,
      photo: studentPhoto?.url || "",
      faceVector: aiRes.data.vector,
      enrolledClasses: []
    });

    return res.status(201).json({
      success: true,
      student
    });

  } catch (error) {
    console.error("Register error:", error);
    // ⚠️ CLEANUP: Delete file on any error
    if (studentPhotoLocalPath && fs.existsSync(studentPhotoLocalPath)) {
        fs.unlinkSync(studentPhotoLocalPath);
    }
    return res.status(500).json({
      message: error.message
    });
  }
};


const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const student = await Student.findOne({ email });
    if (!student) {
      throw new ApiError(404, "Student does not exist");
    }

    const isPasswordCorrect = await student.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Incorrect password");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(student._id);

    const loggedInStudent = await Student.findById(student._id).select(
      "-password -refreshToken"
    );

    const accessTokenExpiry = ms(process.env.ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiry = ms(process.env.REFRESH_TOKEN_EXPIRY);

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: refreshTokenExpiry,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: accessTokenExpiry,
      })
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            student: loggedInStudent,
            accessToken,
            refreshToken,
          },
          "Student logged in successfully"
        )
      );
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Login failed" });
  }
};


const logoutStudent = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.student._id, {
      $unset: { refreshToken: 1 },
    });

    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(new ApiResponse(200, {}, "Student logged out successfully"));
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};


const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const student = await Student.findById(decodedToken?._id);

    if (!student) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== student?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); //ud....................
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      student._id
    );

    const accessTokenExpiry = ms(process.env.ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiry = ms(process.env.REFRESH_TOKEN_EXPIRY);
    
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: refreshTokenExpiry,
    })
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: accessTokenExpiry,
    })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
};


const getStudentClassAttendance = async (req, res) => {
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

const registerStudentToClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const studentId = req.student._id;

    // ✅ FIX 1: Populate 'teacher' to get the name
    const cls = await Class.findById(classId).populate("teacher", "name");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // prevent duplicate enrollment
    if (cls.students.includes(studentId)) {
      return res.status(409).json({ message: "Already enrolled in this class" });
    }

    // add student → class
    cls.students.push(studentId);
    await cls.save();

    // add class → student
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledClasses: classId }
    });

    return res.status(200).json({
      success: true,
      class: {
        id: cls._id,
        name: cls.className,
        subject: cls.subject,
        // ✅ FIX 2: Correctly access the teacher name
        teacher: cls.teacher?.name || "Unknown", 
        schedule: cls.schedule
      }
    });

  } catch (error) {
    console.error("Join class error:", error);
    res.status(500).json({ message: "Failed to join class" });
  }
};


const getMyClasses = async (req, res) => {
  try {
    const studentId = req.student._id;

    // 1️⃣ Get student with enrolled classes
    const student = await Student.findById(studentId)
      .populate({
        path: "enrolledClasses",
        populate: {
          path: "teacher",
          select: "name",
        },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Build class-wise attendance data
    const classesWithStats = await Promise.all(
      student.enrolledClasses.map(async (cls) => {
        // total classes conducted
        const totalClasses = await Attendance.countDocuments({
          classId: cls._id,
        });

        // classes student attended
        const attendedClasses = await Attendance.countDocuments({
          classId: cls._id,
          presentStudents: studentId,
        });

        const attendance =
          totalClasses === 0
            ? 0
            : Number(((attendedClasses / totalClasses) * 100).toFixed(1));

        return {
          _id: cls._id,
          className: cls.className,
          subject: cls.subject,
          teacherName: cls.teacher?.name || "N/A",
          schedule: cls.schedule,
          totalClasses,
          attended: attendedClasses,
          attendance,
        };
      })
    );

    return res.status(200).json({
      success: true,
      classes: classesWithStats,
    });

  } catch (error) {
    console.error("Get my classes error:", error);
    return res.status(500).json({
      message: "Failed to fetch enrolled classes",
    });
  }
};


export{
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    registerStudentToClass,
    getStudentClassAttendance,
    getMyClasses

}
