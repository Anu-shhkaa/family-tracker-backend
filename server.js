require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Expense = require('./models/Expense');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected Sucessfully!"))
.catch(err => console.log("MongoDB Connection Error :", err));

app.get('/',(req,res) => {
    res.send("Family Expense Tracker API is running...");
});
app.post('/add-expense',async (req,res) =>{
try{
    const newExpense = new Expense({
        title: req.body.title,
        amount: req.body.amount,
        paidBy: req.body.paidBy,
        category: req.body.category || 'General'
    });
    const savedExpense = await newExpense.save();
    res.json(savedExpense);
    console.log("Expense Saved:", savedExpense.title);
} catch (error) {
    res.status(500).json({error: "Could not save expense"});
}
});

app.get('/expenses',async(req,res)=>{
    try {
        const allExpenses = await Expense.find().sort({ date: -1});

        const debtSummary = {};
        allExpenses.forEach(item =>{
            if(!item.isSettled && item.paidBy !== 'Papa') {
                if(!debtSummary[item.paidBy]){
                    debtSummary[item.paidBy] = 0;
                }
                debtSummary[item.paidBy] += item.amount;
            }
        });
        res.json({
            debtSummary: debtSummary,
            history: allExpenses
        }
            );
    }catch (error){
        res.status(500).json({error: "Could not fetch expenses"});
    }
});

app.patch('/settle-expense/:id',async(req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id, 
            {isSettled: true},
            {new: true}
        );
        res.json(updatedExpense);
    } catch(error) {
        res.status(500).json({error: "Failed to settle"});
    }
});

app.delete('/delete-expense/:id', async (req,res) => {
    try {
        const deleted = await Expense.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({error: " Expsense not found"});
        res.json({message: "Deleted successfully"});
    } catch (error) {
        res.status(500).json({error: "Failed to delete"});
    }
});

app.put('/update-expense/:id', async(req, res) => {
try{
    const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true }
    );
    res.json(updatedExpense);
} catch (error) {
    res.status(500).json({error: "Failed to update"});
}
});

app.patch('/request-settlement/:id', async(req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            {isPending:true},
            {new: true}
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({error: "Failed to request"});
    }
});

app.patch('/confirm-settlement/:id', async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(
        req.params.id,
        { isSettled: true, isPending: false},
        {new: true}
        );
      res.json(updated);
    } catch (error) {
        res.status(500).json({error:"Failed to confirm"});
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});