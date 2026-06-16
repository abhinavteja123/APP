const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
    try {
        const result = await orderService.placeOrder(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json({ success: true, total: orders.length, data: orders });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

const getOrder = async (req, res) => {
    try {
        const order = await orderService.findOrder(req.params.id);
        res.status(200).json({ success: true, data: order });
    } catch (e) {
        res.status(404).json({ success: false, message: e.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const updated = await orderService.updateOrder(req.params.id, req.body);
        res.status(200).json({ success: true, data: updated });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const removed = await orderService.cancelOrder(req.params.id);
        res.status(200).json({ success: true, data: removed });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder };
