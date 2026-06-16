const orderModel = require('../models/order.model');

// create a new order — userId and items are required at minimum
const placeOrder = async (data) => {
    if (!data.userId) throw new Error('userId is required to place an order');
    if (!data.items || data.items.length === 0) throw new Error('order must have at least one item');
    return orderModel.saveOrder(data);
};

const getAllOrders = async () => orderModel.getOrders();

const findOrder = async (id) => {
    let order = await orderModel.getOrderById(id);
    if (!order) throw new Error(`order with id ${id} not found`);
    return order;
};

// update status or any other field on the order
const updateOrder = async (id, changes) => {
    await findOrder(id); // guard — throw early if doesn't exist
    return orderModel.patchOrder(id, changes);
};

const cancelOrder = async (id) => {
    await findOrder(id);
    return orderModel.destroyOrder(id);
};

module.exports = { placeOrder, getAllOrders, findOrder, updateOrder, cancelOrder };
