const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, required: true },
    amount: Number,
    startDate: Date,
    endDate: Date,
});

module.exports = mongoose.model('Budget', budgetSchema);