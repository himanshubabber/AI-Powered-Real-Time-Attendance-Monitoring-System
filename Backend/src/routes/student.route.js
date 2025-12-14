import { Router } from "express";
import { 
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    registerStudentToClass,
    getStudentClassAttendance,
    getMyClasses
} from "../controllers/student.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import  verifyJWT  from "../middlewares/studentAuth.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerStudent);
router.route("/login").post(loginStudent)
router.route("/logout").post(verifyJWT,logoutStudent);
// Remove /:rollNo so it accepts query parameters
// Remove the "/:rollNo" part so it accepts the "?rollNo=" query
router.route("/class/:classId/attendance/:rollNo").get(verifyJWT, getStudentClassAttendance);
router.route("/join-class").post(verifyJWT,registerStudentToClass);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/my-classes").get(verifyJWT,getMyClasses);


// //secured routes
// router.route("/logout").post(verifyJWT,  logoutCustomer)
// router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// router.route("/current-user").get(verifyJWT, getCurrentCustomer)
// router.route("/:customerId/customerDetails").get( getCustomerDetails)
// router.route("/:customerId/toggle-isliveRequestTo-false").patch( toggleIsLiveRequestToFalse)
// router.route("/update-profilePhoto").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
// router.route("/update-customer-details").post(verifyJWT, updateCustomerDetails)
// router.route("/past-requests").get(verifyJWT, getPastRequests)

export default router
