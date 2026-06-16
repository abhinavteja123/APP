const svc = require('../services/product.service');

// POST /products
exports.createProduct = async (req, res) => {
    try {
        let newProduct = await svc.createProduct(req.body);
        return res.status(201).json({ success: true, data: newProduct });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// GET /products
exports.getAllProducts = async (req, res) => {
    try {
        let products = await svc.listProducts();
        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
    try {
        let product = await svc.getProduct(req.params.id);
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
    try {
        let updated = await svc.editProduct(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
    try {
        let deleted = await svc.deleteProduct(req.params.id);
        res.json({ success: true, data: deleted });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
