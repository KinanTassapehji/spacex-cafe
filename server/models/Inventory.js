const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    item: String,
    stock: Number,
    price: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 5 }
});

module.exports = mongoose.model('Inventory', InventorySchema);
