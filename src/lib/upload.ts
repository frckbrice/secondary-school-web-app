import multer from 'multer';

import { NextApiRequest, NextApiResponse } from 'next';

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
});

// Single file upload middleware
export const uploadSingle = upload.single('image');

// Multiple files upload middleware
export const uploadMultiple = upload.array('images', 10);

// Custom middleware for Next.js API routes
export const multerMiddleware = (uploadType: 'single' | 'array' = 'single') => {
  return (req: NextApiRequest, res: NextApiResponse, next: any) => {
    const uploadFunction =
      uploadType === 'array' ? uploadMultiple : uploadSingle;

    uploadFunction(req as any, res as any, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large. Maximum size is 5MB.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files. Maximum is 10 files.',
          });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // Other errors
        return res.status(400).json({ error: err.message });
      }

      // No errors, proceed
      next();
    });
  };
};

// Helper function to convert multer file to base64 for Cloudinary
export const fileToBase64 = (file: Express.Multer.File): string => {
  const buffer = file.buffer;
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.mimetype};base64,${base64}`;
  return dataURI;
};

// Helper function to validate file types
export const validateFileType = (file: Express.Multer.File): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  return allowedTypes.includes(file.mimetype);
};

// Helper function to validate file size
export const validateFileSize = (
  file: Express.Multer.File,
  maxSize: number = 5 * 1024 * 1024
): boolean => {
  return file.size <= maxSize;
};

// Helper function to generate unique filename
export const generateUniqueFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalname.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};
