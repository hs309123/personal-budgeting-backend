const { Router } = require('express');
const router = Router();
const SavingsGoalController = require('../controllers/savingsGoal.controller');

router.post('/', SavingsGoalController.createSavingsGoal);
router.get('/', SavingsGoalController.getSavingsGoals);
router.get('/:id', SavingsGoalController.getSavingsGoalById);
router.put('/:id', SavingsGoalController.updateSavingsGoal);
router.delete('/:id', SavingsGoalController.deleteSavingsGoal);

module.exports = router;
