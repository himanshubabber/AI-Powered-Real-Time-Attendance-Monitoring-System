import mongoose from "mongoose";

// Sub-schema for schedule
const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    time: {
      type: String,
      required: true, // e.g. "2:00 PM - 4:00 PM"
    },
  },
  { _id: false } // prevents extra _id in schedule array
);

const classSchema = new mongoose.Schema(
  {
    className: { 
      type: String, 
      required: true 
    },

    subject: { 
      type: String, 
      required: true 
    },

    // Reference to the Teacher who owns this class
    teacher: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Teacher",
      required: true,
    },

    // List of students enrolled in this class
    students: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student" 
    }],

    // ✅ FIXED schedule field
    schedule: {
      type: [scheduleSchema],
      default: [],
    },

    // Attendance history
    attendanceHistory: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Attendance" 
    }],
  },
  { timestamps: true }
);

export const Class = mongoose.model("Class", classSchema);
