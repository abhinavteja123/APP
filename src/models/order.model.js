const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const orders = () => getDB().collection('orders');

// Insert a new order document with ISO timestamps
const saveOrder = async (orderData) => {
    const now = new Date();
    orderData.status    = orderData.status || 'pending';
    orderData.createdAt = now;
    orderData.updatedAt = now;
    const result = await orders().insertOne(orderData);
    return orders().findOne({ _id: result.insertedId });
};

const getOrders = async () => {
    return await orders().find({}).toArray();
};

const getOrderById = async (id) => {
    return await orders().findOne({ _id: new ObjectId(id) });
};

// Partial update — always stamp updatedAt
const patchOrder = async (id, fields) => {
    fields.updatedAt = new Date();
    await orders().updateOne(
        { _id: new ObjectId(id) },
        { $set: fields }
    );
    return orders().findOne({ _id: new ObjectId(id) });
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

