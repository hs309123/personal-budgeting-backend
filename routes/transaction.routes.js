const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');


const router = Router();


router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.patch('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);




module.exports = router