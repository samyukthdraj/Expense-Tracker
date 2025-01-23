// controllers/expenseController.js
const Expense = require('../models/expense');
const asyncHandler = require('express-async-handler');

// Get all expenses
const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id });
    res.status(200).json(expenses);
});

// Create new expense
const createExpense = asyncHandler(async (req, res) => {
    const { title, amount, category, date } = req.body;

    const expense = await Expense.create({
        user: req.user.id,
        title,
        amount,
        category,
        date
    });

    res.status(201).json(expense);
});

// Update expense
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedExpense);
});

// Delete expense
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};