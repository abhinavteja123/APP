const db = require('../models/product.model');

async function createProduct(body) {
    // name and price are the bare minimum we need
    if (!body.name || body.name.trim() === '') throw new Error('name is missing');
    if (body.price == null) throw new Error('price cannot be empty');

    return db.addProduct(body);
}

async function listProducts() {
    return db.fetchAll();
}

async function getProduct(id) {
    let product = await db.fetchOne(id);
    if (!product) throw new Error('no product found with that id');
    return product;
}

async function editProduct(id, updates) {
    // make sure product exists before trying to update
    await getProduct(id);
    return db.modifyProduct(id, updates);
}

async function deleteProduct(id) {
    await getProduct(id);
    return db.removeProduct(id);
}

module.exports = { createProduct, listProducts, getProduct, editProduct, deleteProduct };
