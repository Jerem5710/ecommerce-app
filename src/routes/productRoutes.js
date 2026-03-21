const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Category ID to filter products
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A product object
 *       404:
 *         description: Product not found
 */
router.get('/:productId', productController.getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *     responses:
 *       201: { description: Product created successfully }
 *       500: { description: Server error }
 */
router.post('/', isAuthenticated, isAdmin, productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *     responses:
 *       200: { description: Product updated successfully }
 *       404: { description: Product not found }
 *       500: { description: Server error }
 */
router.put('/:id', isAuthenticated, isAdmin, productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Product deleted successfully }
 *       500: { description: Server error }
 */
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);

module.exports = router;