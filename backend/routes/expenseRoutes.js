// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');

// Routes
router.route('/')
    .get(protect, getExpenses)
    .post(protect, createExpense);

router.route('/:id')
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

module.exports = router;