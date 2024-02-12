const express = require('express');
const isAuthenticated = require('../middlewares/isAuthenticated');
const {openAIController} = require('../controllers/openAIController');
const checkApiRequsetLimit = require('../middlewares/checkApiRequestLimit');

const openAIRouter = express.Router();

openAIRouter.post('/generate-content', 
isAuthenticated, 
checkApiRequsetLimit,
openAIController,
)

module.exports = openAIRouter;