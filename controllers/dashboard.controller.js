const Budget = require("../models/budget.model.js");
const Transaction = require("../models/transaction.model.js")
const SavingsGoal = require("../models/savingsGoal.model.js");
const ApiResponse = require("../utils/ApiResponse.utils.js");
const ApiError = require("../utils/ApiError.utils.js");
const catchAsync = require("../utils/catchAsync.utils.js");

class DashboardController {
    // GET /api/dashboard/summary
    static getDashboardSummary = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const [totalBudget, totalSavings, totalExpenses, totalIncome] = await Promise.all([
            Budget.aggregate([
                { $match: { user: userId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            SavingsGoal.aggregate([
                { $match: { user: userId } },
                { $group: { _id: null, total: { $sum: "$targetAmount" } } }
            ]),
            Transaction.aggregate([
                { $match: { user: userId, type: "expense" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Transaction.aggregate([
                { $match: { user: userId, type: "income" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const response = {
            totalBudget: totalBudget[0]?.total || 0,
            totalSavingsGoal: totalSavings[0]?.total || 0,
            totalExpenses: totalExpenses[0]?.total || 0,
            totalIncome: totalIncome[0]?.total || 0,
            balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0)
        };

        return res.status(200).json(new ApiResponse(200, response, "Dashboard summary retrieved."));
    });

    // GET /api/dashboard/recent-transactions
    static getRecentTransactions = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const [recentExpenses, recentIncomes] = await Promise.all([
            Transaction.find({ user: userId, type: "expense" }).sort({ createdAt: -1 }).limit(5),
            Transaction.find({ user: userId, type: "income" }).sort({ createdAt: -1 }).limit(5),
        ]);

        return res.status(200).json(new ApiResponse(200, {
            recentExpenses,
            recentIncomes
        }, "Recent transactions retrieved."));
    });

    // GET /api/dashboard/budget-usage
    static getBudgetUsage = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const [budgets, expenses] = await Promise.all([
            Budget.find({ user: userId }),
            Transaction.find({ user: userId, type: "expense" })
        ]);

        const usage = budgets.map(budget => {
            const spent = expenses
                .filter(exp => exp.category === budget.category)
                .reduce((sum, exp) => sum + exp.amount, 0);

            return {
                category: budget.category,
                allocated: budget.amount,
                spent,
                remaining: budget.amount - spent
            };
        });

        return res.status(200).json(new ApiResponse(200, usage, "Budget usage breakdown retrieved."));
    });

    // GET /api/dashboard/savings-progress
    static getSavingsProgress = catchAsync(async (req, res) => {
        const userId = req.user._id;

        const goals = await SavingsGoal.find({ user: userId });

        const progress = goals.map(goal => ({
            title: goal.title,
            target: goal.targetAmount,
            saved: goal.currentAmount || 0,
            remaining: goal.targetAmount - (goal.currentAmount || 0),
            deadline: goal.deadline
        }));

        return res.status(200).json(new ApiResponse(200, progress, "Savings progress retrieved."));
    });
}

module.exports = DashboardController 
