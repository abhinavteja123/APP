const svc = require('../services/product.service');

// POST /api/products — 201
exports.createProduct = async (req, res) => {
    try {
        const newProduct = await svc.createProduct(req.body);
        return res.status(201).json(newProduct);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// GET /api/products — 200 array
exports.getAllProducts = async (req, res) => {
    try {
        const products = await svc.listProducts();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/products/:id — 200 single doc
exports.getProductById = async (req, res) => {
    try {
        const product = await svc.getProduct(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

// PUT /api/products/:id — 200 updated doc
exports.updateProduct = async (req, res) => {
    try {
        const updated = await svc.editProduct(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        const code = err.message.toLowerCase().includes('not found') ? 404 : 400;
        res.status(code).json({ message: err.message });
    }
};

// DELETE /api/products/:id — 200 with message
exports.deleteProduct = async (req, res) => {
    try {
        await svc.deleteProduct(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        const code = err.message.toLowerCase().includes('not found') ? 404 : 400;
        res.status(code).json({ message: err.message });
    }
};

