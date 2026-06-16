const express = require('express');
const router = express.Router();
const orders = require('../handlers/order.handler');

router.post('/', orders.createOrder);
router.get('/', orders.getOrders);
router.get('/:id', orders.getOrder);
router.put('/:id', orders.updateOrder);
router.delete('/:id', orders.deleteOrder);

module.exports = router;
