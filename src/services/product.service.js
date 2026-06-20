const db = require('../models/product.model');

async function createProduct(body) {
    if (!body.name        || String(body.name).trim() === '')        throw new Error('name is required');
    if (!body.description || String(body.description).trim() === '') throw new Error('description is required');
    if (body.price == null || body.price < 0)                        throw new Error('price is required and must be >= 0');
    if (body.quantity == null || body.quantity < 0)                  throw new Error('quantity is required and must be >= 0');
    if (!body.category    || String(body.category).trim() === '')    throw new Error('category is required');
    return db.addProduct(body);
}

async function listProducts() {
    return db.fetchAll();
}

async function getProduct(id) {
    const product = await db.fetchOne(id);
    if (!product) throw new Error('No product found with that id');
    return product;
}

async function editProduct(id, updates) {
    await getProduct(id); // ensure exists
    return db.modifyProduct(id, updates);
}

async function deleteProduct(id) {
    await getProduct(id);
    return db.removeProduct(id);
}

module.exports = { createProduct, listProducts, getProduct, editProduct, deleteProduct };

