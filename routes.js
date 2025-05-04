const { Router } = require("express")
const userRoutes = require("./routes/user.routes")
const dashboardRoutes = require("./routes/dashboard.route")
const transactionRoutes = require("./routes/transaction.routes")
const budgetRoutes = require("./routes/budget.route")
const savingsGoalRoutes = require("./routes/savingsGoal.route")
const verifyToken = require("./middleware/verifyToken")
const router = Router()


//unprotected routes

router.use("/user", userRoutes)

router.use(verifyToken)

//protected routes

router.use('/dashboard', dashboardRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budget', budgetRoutes);
router.use('/savings-goal', savingsGoalRoutes);





module.exports = router