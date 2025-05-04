const SavingsGoal = require('../models/savingsGoal.model');
const ApiResponse = require('../utils/ApiResponse.utils');
const ApiError = require('../utils/ApiError.utils');
const catchAsync = require('../utils/catchAsync.utils');

class SavingsGoalController {
    // Create a new savings goal
    static createSavingsGoal = catchAsync(async (req, res) => {
        const { title, targetAmount, deadline } = req.body;
        const userId = req.user._id;

        const savingsGoal = await SavingsGoal.create({
            user: userId,
            title,
            targetAmount,
            deadline
        });

        return res.status(201).json(new ApiResponse(201, savingsGoal, "Savings goal created successfully."));
    });

    // Get all savings goals for a user
    static getSavingsGoals = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const goals = await SavingsGoal.find({ user: userId }).sort({ deadline: 1 });

        return res.status(200).json(new ApiResponse(200, goals, "Savings goals retrieved successfully."));
    });

    // Get a single savings goal by ID
    static getSavingsGoalById = catchAsync(async (req, res) => {
        const { id } = req.params;

        const goal = await SavingsGoal.findById(id);

        if (!goal) {
            throw new ApiError(404, "Savings goal not found.");
        }

        return res.status(200).json(new ApiResponse(200, goal, "Savings goal retrieved successfully."));
    });

    // Update a savings goal (e.g., increase current amount or change target)
    static updateSavingsGoal = catchAsync(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        const goal = await SavingsGoal.findByIdAndUpdate(id, updateData, { new: true });

        if (!goal) {
            throw new ApiError(404, "Savings goal not found.");
        }

        return res.status(200).json(new ApiResponse(200, goal, "Savings goal updated successfully."));
    });

    // Delete a savings goal
    static deleteSavingsGoal = catchAsync(async (req, res) => {
        const { id } = req.params;

        const goal = await SavingsGoal.findByIdAndDelete(id);

        if (!goal) {
            throw new ApiError(404, "Savings goal not found.");
        }

        return res.status(200).json(new ApiResponse(200, null, "Savings goal deleted successfully."));
    });
}

module.exports = SavingsGoalController;
