const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Usercollection = () => {
return getDB().collection("users");
};

const createUser = async (userData) => {
    return await Usercollection().insertOne(userData);
};

const getallUsers = async () => {
    return await Usercollection().find().toArray();
};
const getUserById = async (id) => {
    return await Usercollection().findOne({_id: new ObjectId(id)});
};

const updateUser = async (id, userData) => {
    return await Usercollection().updateOne({_id: new ObjectId(id)}, {$set: userData});
};

const deleteUser = async (id) => {
    return await Usercollection().deleteOne({_id: new ObjectId(id)});
};

module.exports = {
    createUser,
    getallUsers,
    getUserById,
    updateUser,
    deleteUser
};