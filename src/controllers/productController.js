const productModel = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const categoryId = req.query.category || null;
        const products = await productModel.getProducts(categoryId);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    try {
        const newProduct = await productModel.createProduct(name, description, price, stock);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    try {
        const updatedProduct = await productModel.updateProduct(id, name, description, price, stock);
        if (updatedProduct) res.json(updatedProduct);
        else res.status(404).json({ error: 'Product not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await productModel.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};