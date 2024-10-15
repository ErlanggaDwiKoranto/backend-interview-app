const express = require('express');
const { uploadVideoToFolder, upload } = require('../controllers/uploadController.js');
const { getQuestions } = require('../controllers/questionController.js');

const interviewRouter = new express.Router();

// Endpoint for uploading the video
interviewRouter.post('/upload-file', upload.single('video'), uploadVideoToFolder);

// Endpoint to get questions
interviewRouter.get('/questions', getQuestions);

module.exports = { interviewRouter };
