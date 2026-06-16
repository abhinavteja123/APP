const express = require('express');
const userRouter = require('./src/router/user.router');
const app = express();
app.use(express.json());
app.use('/users', userRouter);  
module.exports = app;