const Transaction = require('../models/transaction.model');
const ApiResponse = require("../utils/ApiResponse.utils");
const ApiError = require("../utils/ApiError.utils");
const catchAsync = require("../utils/catchAsync.utils");

class TransactionController {
    // Create a new transaction
    static createTransaction = catchAsync(async (req, res) => {
        const { title, amount, type, category, date } = req.body;
        const userId = req.user._id;

        const transaction = await Transaction.create({
            title,
            amount,
            type,
            category,
            user: userId,
            date: date || Date.now()
        });

        return res.status(201).json(new ApiResponse(201, transaction, "Transaction created successfully."));
    });

    // Get all transactions for a user
    static getTransactions = catchAsync(async (req, res) => {
        const userId = req.user._id;
        const type = req.query.type || "income"

        const transactions = await Transaction.find({ user: userId, type }).sort({ date: -1 });

        return res.status(200).json(new ApiResponse(200, transactions, "Transactions retrieved successfully."));
    });

    // Get a single transaction by ID
    static getTransactionById = catchAsync(async (req, res) => {
        const { id } = req.params;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            throw new ApiError(404, "Transaction not found.");
        }

        return res.status(200).json(new ApiResponse(200, transaction, "Transaction retrieved successfully."));
    });

    // Update a transaction
    static updateTransaction = catchAsync(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });

        if (!transaction) {
            throw new ApiError(404, "Transaction not found.");
        }

        return res.status(200).json(new ApiResponse(200, transaction, "Transaction updated successfully."));
    });

    // Delete a transaction
    static deleteTransaction = catchAsync(async (req, res) => {
        const { id } = req.params;
        const transaction = await Transaction.findByIdAndDelete(id);

        if (!transaction) {
            throw new ApiError(404, "Transaction not found.");
        }

        return res.status(200).json(new ApiResponse(200, null, "Transaction deleted successfully."));
    });
}

module.exports = TransactionController;
