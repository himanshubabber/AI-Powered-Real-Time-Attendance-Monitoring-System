import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    phoneNo: { type: String },
    refreshToken: { type: String },
    photo: { type: String },
    // The AI Fingerprint (512 numbers)
    faceVector: { type: [Number], required: true },
    
    // Optional: Which classes is this student enrolled in?
    enrolledClasses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class' 
    }]
});
studentSchema.pre("save", async function () { // <--- No 'next' parameter
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

studentSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

studentSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

studentSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

