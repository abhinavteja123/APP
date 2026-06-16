const userModel = require('../models/user.modedl');

const createUser = async (userData) => {
    if (!userData.name ) {
        throw new Error('Name is required');
    }
    return await userModel.createUser(userData);
};

const getallUsers = async () => {
    return await userModel.getallUsers();
};

const getUserById = async (id) => {
    return await userModel.getUserById(id);
};

const updateUser = async (id, userData) => {
    return await userModel.updateUser(id, userData);
};

const deleteUser = async (id) => {
    return await userModel.deleteUser(id);
};

module.exports = {
    createUser,
    getallUsers,
    getUserById,
    updateUser,
    deleteUser
};
