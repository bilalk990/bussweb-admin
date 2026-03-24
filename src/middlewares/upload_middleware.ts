import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

export const uploadImage = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
});

// Since controllers still use uploadToCloudinary, we'll mock it to return the local URL instead!
export const uploadToCloudinary = async (file: Express.Multer.File, folder: string) => {
    // The file is already saved by diskStorage by the time this is called!
    // file.filename contains the saved file's name.
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;
    return Promise.resolve({ secure_url: fileUrl, url: fileUrl });
};
