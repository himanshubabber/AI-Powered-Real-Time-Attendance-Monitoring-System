import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js";

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import teacherRouter from "./routes/teacher.route.js"
import classRouter from "./routes/class.route.js"
import attendanceRouter from "./routes/attendance.route.js"
import studentRouter from "./routes/student.route.js"
// import workerRouter from "./routes/worker.route.js"
// import serviceRequestRouter from "./routes/serviceRequest.route.js"
// import paymentRouter from "./routes/payment.route.js"

app.use("/api/v1/teacher", teacherRouter)
app.use("/api/v1/class", classRouter)
app.use("/api/v1/attendance", attendanceRouter)
app.use("/api/v1/student", studentRouter)
// app.use("/api/v1/service-request", serviceRequestRouter)
// app.use("/api/v1/payment", paymentRouter)

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors || []
        });
    }

    console.error(err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        errors: []
    });
});


export { app }