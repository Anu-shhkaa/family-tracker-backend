const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paidBy: {
        type: String,
        required: true,
        enum: ['Anushka', 'Mummy', 'Atharva', 'Papa']
    },
    isSettled: {
        type: Boolean,
        default: false
    },
    isPending:{
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: true,
        enum: ['Food' , 'Travel', 'Bills', 'Medical', 'Shopping', 'General'],
        default: 'General'
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Expense', ExpenseSchema);