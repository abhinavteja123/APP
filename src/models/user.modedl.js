const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Usercollection = () => getDB().collection('users');

// Insert with createdAt + updatedAt timestamps
const createUser = async (userData) => {
    const now = new Date();
    userData.createdAt = now;
    userData.updatedAt = now;
    const result = await Usercollection().insertOne(userData);
    return Usercollection().findOne({ _id: result.insertedId });
};

const getallUsers = async () => {
    return await Usercollection().find().toArray();
};

const getUserById = async (id) => {
    return await Usercollection().findOne({ _id: new ObjectId(id) });
};

// Partial update — stamp updatedAt, return fresh document
const updateUser = async (id, userData) => {
    userData.updatedAt = new Date();
    await Usercollection().updateOne({ _id: new ObjectId(id) }, { $set: userData });
    return Usercollection().findOne({ _id: new ObjectId(id) });
};

const deleteUser = async (id) => {
    return await Usercollection().deleteOne({ _id: new ObjectId(id) });
};

module.exports = {
    createUser,
    getallUsers,
    getUserById,
    updateUser,
    deleteUser
};