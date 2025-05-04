const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    targetAmount: Number,
    currentAmount: { type: Number, default: 0 },
    deadline: Date,
});

module.exports = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', savingsGoalSchema);