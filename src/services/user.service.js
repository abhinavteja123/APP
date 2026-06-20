const userModel = require('../models/user.modedl');

const createUser = async (userData) => {
    if (!userData.name    || String(userData.name).trim()    === '') throw new Error('name is required');
    if (!userData.email   || String(userData.email).trim()   === '') throw new Error('email is required');
    if (!userData.phone   || String(userData.phone).trim()   === '') throw new Error('phone is required');
    if (!userData.address || String(userData.address).trim() === '') throw new Error('address is required');
    // normalise email to lowercase per spec
    userData.email = String(userData.email).toLowerCase().trim();
    return await userModel.createUser(userData);
};

const getallUsers = async () => {
    return await userModel.getallUsers();
};

const getUserById = async (id) => {
    const user = await userModel.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
};

const updateUser = async (id, userData) => {
    // normalise email if being updated
    if (userData.email) userData.email = String(userData.email).toLowerCase().trim();
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

