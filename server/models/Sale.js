const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    category: String,
    item: String,
    amount: Number,
    price: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);
