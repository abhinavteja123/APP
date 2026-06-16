const { Router } = require('express');
const handler = require('../handlers/product.handler');

const router = Router();

router.route('/')
    .post(handler.createProduct)
    .get(handler.getAllProducts);

router.route('/:id')
    .get(handler.getProductById)
    .put(handler.updateProduct)
    .delete(handler.deleteProduct);

module.exports = router;
