const mongodb = require('mongodb');
const { getDB } = require('../config/db');

// just a shorthand so we don't repeat this everywhere
function col() {
    return getDB().collection('products');
}

async function addProduct(data) {
    data.createdAt = new Date();
    return col().insertOne(data);
}

async function fetchAll() {
    let results = await col().find({}).toArray();
    return results;
}

async function fetchOne(id) {
    return col().findOne({ _id: new mongodb.ObjectId(id) });
}

// only update fields that are passed in — don't wipe the whole doc
async function modifyProduct(id, changes) {
    let res = await col().updateOne(
        { _id: new mongodb.ObjectId(id) },
        { $set: changes }
    );
    return res;
}

async function removeProduct(id) {
    return col().deleteOne({ _id: new mongodb.ObjectId(id) });
}

module.exports = { addProduct, fetchAll, fetchOne, modifyProduct, removeProduct };
