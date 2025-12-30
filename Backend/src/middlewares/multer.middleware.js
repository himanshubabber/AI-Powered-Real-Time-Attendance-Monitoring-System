import multer from "multer";
import os from "os"; 

// We use the system's default temp directory.
// On Cloud (Render/Vercel): This is '/tmp'
// On Local (Windows/Mac): This is your OS temp folder
const tempDir = os.tmpdir();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to the system temp directory
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Keep unique filename
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });
