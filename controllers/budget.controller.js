const Budget = require('../models/budget.model');
const ApiResponse = require('../utils/ApiResponse.utils');
const ApiError = require('../utils/ApiError.utils');
const catchAsync = require('../utils/catchAsync.utils');

class BudgetController {
    // Create a new budget
    static createBudget = catchAsync(async (req, res) => {
        const { category, amount, startDate, endDate } = req.body;
        const userId = req.user._id;

        const budget = await Budget.create({
            user: userId,
            category,
            amount,
            startDate,
            endDate
        });

        return res.status(201).json(new ApiResponse(201, budget, "Budget created successfully."));
    });

    // Get all budgets for the user
    static getBudgets = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const budgets = await Budget.find({ user: userId });

        return res.status(200).json(new ApiResponse(200, budgets, "Budgets retrieved successfully."));
    });

    // Get a budget by ID
    static getBudgetById = catchAsync(async (req, res) => {
        const { id } = req.params;

        const budget = await Budget.findById(id);

        if (!budget) {
            throw new ApiError(404, "Budget not found.");
        }

        return res.status(200).json(new ApiResponse(200, budget, "Budget retrieved successfully."));
    });

    // Update a budget
    static updateBudget = catchAsync(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        const budget = await Budget.findByIdAndUpdate(id, updateData, { new: true });

        if (!budget) {
            throw new ApiError(404, "Budget not found.");
        }

        return res.status(200).json(new ApiResponse(200, budget, "Budget updated successfully."));
    });

    // Delete a budget
    static deleteBudget = catchAsync(async (req, res) => {
        const { id } = req.params;

        const budget = await Budget.findByIdAndDelete(id);

        if (!budget) {
            throw new ApiError(404, "Budget not found.");
        }

        return res.status(200).json(new ApiResponse(200, null, "Budget deleted successfully."));
    });
}

module.exports = BudgetController;
