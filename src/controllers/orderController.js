const orderModel = require('../models/orderModel');

exports.createOrder = async (req, res) => {
    const { userId, total, items } = req.body;
    try {
        const order = await orderModel.createOrder(userId, total);
        await orderModel.addOrderItems(order.id, items);
        const fullOrder = await orderModel.getOrdersByUserId(userId);
        res.status(201).json(fullOrder[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const orders = await orderModel.getOrdersByUserId(req.params.userId);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await orderModel.updateOrderStatus(req.params.orderId, req.body.status);
        if (updatedOrder) res.json(updatedOrder);
        else res.status(404).json({ error: 'Order not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const userIdFilter = req.query.userId || null;
        const orders = await orderModel.getAllOrders(userIdFilter);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};