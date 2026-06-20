const orderService = require('../services/order.service');

// POST /api/orders — 201 on success
const createOrder = async (req, res) => {
    try {
        const result = await orderService.placeOrder(req.body);
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

// GET /api/orders — 200 array
const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// GET /api/orders/:id — 200 single doc
const getOrder = async (req, res) => {
    try {
        const order = await orderService.findOrder(req.params.id);
        res.status(200).json(order);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

// PUT /api/orders/:id — 200 updated doc
const updateOrder = async (req, res) => {
    try {
        const updated = await orderService.updateOrder(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (e) {
        const code = e.message.includes('not found') ? 404 : 400;
        res.status(code).json({ message: e.message });
    }
};

// DELETE /api/orders/:id — 200 with message
const deleteOrder = async (req, res) => {
    try {
        await orderService.cancelOrder(req.params.id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (e) {
        const code = e.message.includes('not found') ? 404 : 400;
        res.status(code).json({ message: e.message });
    }
};

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder };

