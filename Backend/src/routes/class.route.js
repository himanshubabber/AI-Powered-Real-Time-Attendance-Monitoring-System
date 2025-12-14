import { Router } from "express";
import { 
    createClass,
    getMyClasses,
    getClassById
} from "../controllers/class.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/teacherAuth.middleware.js";


const router = Router()

router.route("/create").post(verifyJWT,createClass);
router.route("/my-classes").get(verifyJWT,getMyClasses);
router.route("/:classId").get(verifyJWT, getClassById);

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