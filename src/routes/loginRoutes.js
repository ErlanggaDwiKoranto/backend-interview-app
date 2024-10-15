const express = require('express');
const { getUsers, login} = require('../controllers/loginController.js');
const loginRouter = new express.Router();

loginRouter.post('/login', login); // Adjusted to /login to match fetch requests

module.exports = { loginRouter };
