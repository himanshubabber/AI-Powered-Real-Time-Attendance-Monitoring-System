import { Router } from "express";
import { 
    markAttendance,
    getAttendanceDetail
} from "../controllers/attendance.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
