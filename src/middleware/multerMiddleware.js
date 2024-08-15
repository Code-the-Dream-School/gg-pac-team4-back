const multer = require('multer');
const path = require('path');
const MAX_IMAGE_SIZE = 1024 * 1024 * 8; // 8MB size of image
const MAX_VIDEO_SIZE = 1024 * 1024 * 10; // 10MB for videos

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(__dirname, '../../public/uploads');
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/avif',
    'image/webp',
  ];
  const videoMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (imageMimeTypes.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE) {
      return cb(
        new Error('Image size too large, max 8MB allowed', 'LIMIT_FILE_SIZE'),
        false
      );
    }
    cb(null, true);
  } else if (videoMimeTypes.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE) {
      return cb(
        new Error('Video size too large, max 50MB allowed', 'LIMIT_FILE_SIZE'),
        false
      );
    }
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Upload jpeg, png, avif, webp, mp4, mpeg, mov, or avi',
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(MAX_IMAGE_SIZE, MAX_VIDEO_SIZE),
  },
});

module.exports = upload;
