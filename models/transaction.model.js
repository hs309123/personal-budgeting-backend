const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    title: String,
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);