import { Router } from "express";
import { 
    registerteacher,
    loginteacher,
    logoutteacher,
    refreshAccessToken
} from "../controllers/teacher.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/teacherAuth.middleware.js";

// ✅ IMPORT THE ATTENDANCE CONTROLLER
import { getAttendanceDetail } from "../controllers/attendance.controller.js";

const router = Router();

// Public Routes
router.route("/register").post(upload.single("profilePhoto"), registerteacher);
router.route("/login").post(loginteacher);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutteacher);
router.route("/refresh-token").post(refreshAccessToken);

// ✅ ADD THIS MISSING ROUTE
// This enables: GET /api/v1/teacher/class/:classId/attendance/:date
router.route("/class/:classId/attendance/:date").get(verifyJWT, getAttendanceDetail);

export default router;
