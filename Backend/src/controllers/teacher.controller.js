import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import { Teacher } from '../models/teacher.model.js';
import ms from 'ms';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const generateAccessAndRefreshTokens = async (teacherId) => {
  try {
    const teacher = await Teacher.findById(teacherId);
    const accessToken = teacher.generateAccessToken();
    const refreshToken = teacher.generateRefreshToken();
    teacher.refreshToken = refreshToken;
    await teacher.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerteacher = async (req, res) => {
  try {
    console.log("✅ registerteacher hit");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, password } = req.body;

    const teacherPhotoLocalPath = req.file?.path;
    console.log("PHOTO PATH:", teacherPhotoLocalPath);

    let teacherPhoto;
    if (teacherPhotoLocalPath) {
      console.log("Uploading to cloudinary...");
      teacherPhoto = await uploadOnCloudinary(teacherPhotoLocalPath);
      console.log("Cloudinary response:", teacherPhoto);
    }

    const newTeacher = await Teacher.create({
      name,
      email,
      password,
      photo: teacherPhoto ? teacherPhoto.url : "",
      classes: [],
    });

    console.log("Teacher created:", newTeacher._id);

    return res.status(201).json({
      success: true,
      teacher: newTeacher,
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR FULL:", err); // 👈 THIS IS KEY
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const loginteacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher does not exist" });
    }

    const isPasswordCorrect = await teacher.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(teacher._id);

    // Use a fallback if process.env is missing to prevent crashes
    const accessTokenExpiry = ms(process.env.ACCESS_TOKEN_EXPIRY || "1d");
    const refreshTokenExpiry = ms(process.env.REFRESH_TOKEN_EXPIRY || "10d");

    const options = {
      httpOnly: true,
      secure: true,      // Required for HTTPS on Vercel
      sameSite: "none",  // Lowercase is safer; must be "none" for cross-domain
      path: "/",         // Ensures cookie is sent to all /api routes
    };

    const loggedInTeacher = await Teacher.findById(teacher._id).select("-password -refreshToken");

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, { ...options, maxAge: refreshTokenExpiry })
      .cookie("accessToken", accessToken, { ...options, maxAge: accessTokenExpiry })
      .json(
        new ApiResponse(
          200,
          {
            teacher: loggedInTeacher,
            accessToken, // Sending this in JSON as a backup for the frontend
            refreshToken,
          },
          "Teacher logged in successfully"
        )
      );
  } catch (error) {
    console.error("LOGIN_ERROR_DETAILS:", error); // This will show up in Vercel Logs
    return res.status(500).json({ 
        success: false, 
        message: error?.message || "Internal Server Error during login" 
    });
  }

};


const logoutteacher = async (req, res) => {
  try{
    await Teacher.findByIdAndUpdate(
    req.teacher._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "teacher logged out successfully"));
  }
    catch(error){
        throw new ApiError(500, "Logout failed");
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

    const teacher = await Teacher.findById(decodedToken?._id);

    if (!teacher) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== teacher?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); //ud....................
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      teacher._id
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

export{
    registerteacher,
    loginteacher,
    logoutteacher,
    refreshAccessToken
};
