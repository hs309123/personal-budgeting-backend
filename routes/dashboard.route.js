const { Router } = require("express");
const DashboardController = require("../controllers/dashboard.controller");

const router = Router();

router.get("/summary", DashboardController.getDashboardSummary);
router.get("/recent-transactions", DashboardController.getRecentTransactions);
router.get("/budget-usage", DashboardController.getBudgetUsage);
router.get("/savings-progress", DashboardController.getSavingsProgress);

module.exports = router;
