// models/expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    date: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);