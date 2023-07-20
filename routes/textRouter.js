const textRouter = require('express').Router();
const textController = require('./../controllers/textController');

textRouter.get('/text', textController.getText).post('/text', textController.postText);





module.exports = textRouter;