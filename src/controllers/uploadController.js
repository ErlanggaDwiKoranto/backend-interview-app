const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Set up Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '..', 'config', 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the 'uploads' folder exists
    cb(null, uploadPath); // Save the file to this directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append correct extension to file name
  }
});

const upload = multer({ storage: storage });

async function uploadVideoToGoogleDrive(folderId, videoPath, videoName) {
  const fileMetadata = {
    name: videoName,
    parents: [folderId]
  };

  const media = {
    mimeType: 'video/webm', // Ensure this matches your video MIME type
    body: fs.createReadStream(videoPath) // Read the video file from the disk
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, mimeType, size'
    });
    console.log(`File uploaded successfully: ${file.data.name}, ID: ${file.data.id}, Size: ${file.data.size} bytes`);
    return file.data;
  } catch (error) {
    console.error('Error uploading video to Google Drive:', error);
    throw error;
  }
}

async function uploadVideoToFolder(req, res) {
  const { folderUrl } = req.body;
  const folderId = folderUrl.split('/').pop(); // Extract folder ID from Google Drive URL
  const videoFile = req.file; // Get the file from Multer

  console.log('Upload request received for folder:', folderUrl);
  console.log('File details:', videoFile);

  if (!videoFile) {
    console.error('No video file provided in the request.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const videoPath = path.join(__dirname, '..', 'uploads', videoFile.filename); // Correct file path
    console.log('Uploading video from path:', videoPath);

    // Upload to Google Drive
    const result = await uploadVideoToGoogleDrive(folderId, videoPath, videoFile.originalname);

    // Delete the file from local after successful upload
    fs.unlinkSync(videoPath);

    console.log(`Video uploaded successfully to Google Drive: ${result.id}`);
    res.json({ message: 'Video uploaded successfully', fileId: result.id });
  } catch (error) {
    console.error('Error uploading video to Google Drive:', error);
    res.status(500).json({ error: 'Failed to upload video to Google Drive' });
  }
}

module.exports = { uploadVideoToFolder, upload };
