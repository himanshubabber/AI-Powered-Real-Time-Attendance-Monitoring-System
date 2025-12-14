import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    // Link back to the Class
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Array of References to Present Students
    presentStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    photoEvidence: { type: String } // Path to group photo
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);