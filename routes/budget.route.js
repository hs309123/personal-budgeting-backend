const { Router } = require('express');
const router = Router();
const BudgetController = require('../controllers/budget.controller');

// Optional: Add authentication middleware
// const authenticate = require('../middleware/auth');

router.post('/', BudgetController.createBudget);
router.get('/', BudgetController.getBudgets);
router.get('/:id', BudgetController.getBudgetById);
router.put('/:id', BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

module.exports = router;