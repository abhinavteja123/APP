const orderModel = require('../models/order.model');

// Create a new order — userId, products[], and totalAmount are required
const placeOrder = async (data) => {
    if (!data.userId) throw new Error('userId is required');
    if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error('products array must have at least one item');
    }
    if (data.totalAmount == null || data.totalAmount < 0) {
        throw new Error('totalAmount is required and must be >= 0');
    }
    // validate each product line
    data.products.forEach((item, i) => {
        if (!item.productId) throw new Error(`products[${i}].productId is required`);
        if (!item.quantity || item.quantity < 1) throw new Error(`products[${i}].quantity must be >= 1`);
        if (item.price == null) throw new Error(`products[${i}].price is required`);
    });
    return orderModel.saveOrder(data);
};

const getAllOrders = async () => orderModel.getOrders();

const findOrder = async (id) => {
    const order = await orderModel.getOrderById(id);
    if (!order) throw new Error(`Order with id ${id} not found`);
    return order;
};

// Update status, totalAmount, or products on an order
const updateOrder = async (id, changes) => {
    await findOrder(id); // guard — throws if not found
    return orderModel.patchOrder(id, changes);
};

const cancelOrder = async (id) => {
    await findOrder(id);
    return orderModel.destroyOrder(id);
};

module.exports = { placeOrder, getAllOrders, findOrder, updateOrder, cancelOrder };

