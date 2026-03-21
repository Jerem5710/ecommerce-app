const categoryModel = require('../models/categoryModel');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.getCategories();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};