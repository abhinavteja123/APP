const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const orders = () => getDB().collection('orders');

// insert a new order document
const saveOrder = async (orderData) => {
    orderData.placedAt = new Date();
    orderData.status = orderData.status || 'pending';
    return await orders().insertOne(orderData);
};

const getOrders = async () => {
    return await orders().find({}).toArray();
};

const getOrderById = async (id) => {
    return await orders().findOne({ _id: new ObjectId(id) });
};

// partial update — caller decides which fields change
const patchOrder = async (id, fields) => {
    return await orders().updateOne(
        { _id: new ObjectId(id) },
        { $set: fields }
    );
};

const destroyOrder = async (id) => {
    return await orders().deleteOne({ _id: new ObjectId(id) });
};

module.exports = {
    saveOrder,
    getOrders,
    getOrderById,
    patchOrder,
    destroyOrder,
};
