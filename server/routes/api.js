const express = require('express');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Session = require('../models/Session');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Sales endpoints
router.post('/sales', async (req, res) => {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
});

router.get('/sales', async (req, res) => {
    const sales = await Sale.find();
    res.json(sales);
});

// Inventory endpoints
router.post('/inventory', async (req, res) => {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
});

router.get('/inventory', async (req, res) => {
    const inventory = await Inventory.find();
    res.json(inventory);
});

// Session endpoints
router.post('/sessions', async (req, res) => {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
});

router.get('/sessions', async (req, res) => {
    let query = {};
    if (req.query.active === 'true') {
        query.endTime = null;
    }
    const sessions = await Session.find(query);
    res.json(sessions);
});

router.patch('/sessions/:id', async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Auth: Register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!['admin', 'staff'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    try {
        const user = new User({ username, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Auth: Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server configuration error' });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
});

// Store Management: Add item
router.post('/inventory/add', async (req, res) => {
    const { item, stock, price } = req.body;
    if (!item || typeof stock !== 'number' || typeof price !== 'number') {
        return res.status(400).json({ error: 'Item name, stock, and price required' });
    }
    if (stock < 0) {
        return res.status(400).json({ error: 'Stock cannot be negative' });
    }
    if (price < 0) {
        return res.status(400).json({ error: 'Price cannot be negative' });
    }
    try {
        // Check for duplicate item
        const existing = await Inventory.findOne({ item });
        if (existing) {
            return res.status(400).json({ error: 'Item already exists' });
        }
        const inv = new Inventory({ item, stock, price });
        await inv.save();
        res.status(201).json(inv);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Store Management: Remove item
router.delete('/inventory/:id', async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Store Management: Update stock (income/output) and price
router.patch('/inventory/:id', async (req, res) => {
    const { stock, price } = req.body; // positive for income, negative for output
    try {
        const inv = await Inventory.findById(req.params.id);
        if (!inv) return res.status(404).json({ error: 'Item not found' });
        if (stock !== undefined) {
            const newStock = inv.stock + stock;
            if (newStock < 0) {
                return res.status(400).json({ error: 'Stock cannot be negative' });
            }
            inv.stock = newStock;
        }
        if (price !== undefined) {
            if (price < 0) {
                return res.status(400).json({ error: 'Price cannot be negative' });
            }
            inv.price = price;
        }
        await inv.save();
        res.json(inv);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Middleware to verify token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ message: 'Server configuration error' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}


// Income analytics endpoints
router.get('/income/:period', async (req, res) => {
    const { period } = req.params; // 'day', 'month', 'year'
    try {
        const sales = await Sale.find();
        const now = new Date();
        let filteredSales = [];

        if (period === 'day') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            filteredSales = sales.filter(sale => new Date(sale.timestamp) >= today);
        } else if (period === 'month') {
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            filteredSales = sales.filter(sale => new Date(sale.timestamp) >= thisMonth);
        } else if (period === 'year') {
            const thisYear = new Date(now.getFullYear(), 0, 1);
            filteredSales = sales.filter(sale => new Date(sale.timestamp) >= thisYear);
        }

        const totalIncome = filteredSales.reduce((sum, sale) => sum + sale.price, 0);
        res.json({ period, totalIncome, count: filteredSales.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/income/device/:type', async (req, res) => {
    const { type } = req.params; // 'PC', 'PS4', 'PS5', 'Bilardo'
    try {
        const sales = await Sale.find({ category: type });
        const totalIncome = sales.reduce((sum, sale) => sum + sale.price, 0);
        res.json({ deviceType: type, totalIncome, count: sales.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
