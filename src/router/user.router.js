const express = require('express');
const router = express.Router();
const userHandler = require('../handlers/user.handler');

router.post('/', userHandler.createUser);
router.get('/', userHandler.getAllUsers);
router.get('/:id', userHandler.getUserById);
router.put('/:id', userHandler.updateUser);
router.delete('/:id', userHandler.deleteUser);

module.exports = router;    


