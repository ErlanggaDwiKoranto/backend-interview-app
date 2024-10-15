const express = require('express');
const {getDevisi} = require('../controllers/roleDevisiController');
const {getSubDevisi} = require('../controllers/roleSubDevisiController');
const {updateRole} = require('../controllers/roleUpdateController');
const roleRouter = express.Router();

roleRouter.get('/role-devisi', getDevisi);
roleRouter.get('/role-sub-devisi', getSubDevisi);
roleRouter.post('/update-role', updateRole);

module.exports = {roleRouter};
