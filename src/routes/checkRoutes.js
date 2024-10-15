const express = require('express');
const {getUserByIdTele, saveFolderLink,getFolderLink } = require('../controllers/checkController.js');
const {createAndShareFolder, findFolder } = require('../controllers/createFolderController.js');
const checkRouter = new express.Router();

checkRouter.get('/data-user/:idTele', getUserByIdTele);
checkRouter.get('/create-folder/:idTele', createAndShareFolder);
checkRouter.get('/find-folder-exist/:idTele', findFolder);
checkRouter.post('/save-folder-link', saveFolderLink); // New route for saving folder link
checkRouter.get('/get-folder-link/:idTele', getFolderLink);

module.exports = { checkRouter };
