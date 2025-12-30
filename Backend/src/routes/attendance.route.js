import { Router } from "express";
import { 
    markAttendance,
    getAttendanceDetail,
    getAttendanceByDate
} from "../controllers/attendance.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyTeacher  from "../middlewares/teacherAuth.middleware.js";

// ⚠️ FIX: Use curly braces { } for named import
import  verifyJWT  from "../middlewares/teacherAuth.middleware.js"; 

const router = Router();

// ✅ Mark Attendance Route
router.route("/mark").post(
    verifyJWT, 
    upload.single("groupPhoto"), 
    markAttendance
);

// ✅ Get Attendance Detail Route
router.route("/:classId/:date").post(verifyJWT, getAttendanceDetail);
router.get("/class/:classId/date/:date", verifyTeacher, getAttendanceByDate);

export default router;
