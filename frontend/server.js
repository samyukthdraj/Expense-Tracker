import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const server = express();
server.use(express.json());

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: true  // Optional: adds createdAt and updatedAt timestamps
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add the matchPassword method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);


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

const Expense = mongoose.model('Expense', expenseSchema);


// Middlewares
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
          return; // added return for better error control
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
      return; // added return for better error control
    }
};

// Controller
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses
const getExpenses = async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id });
    res.status(200).json(expenses);
};

// Create new expense
const createExpense = async (req, res) => {
    const { title, amount, category, date, reason } = req.body;

    const expense = await Expense.create({
        user: req.user.id,
        title,
        amount,
        category,
        date,
        reason
    });

    res.status(201).json(expense);
};

// Update expense
const updateExpense = async (req, res) => {
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
};

// Delete expense
const deleteExpense = async (req, res) => {
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
};


// Routes
server.post('/api/users/signup', registerUser);
server.post('/api/users/login', loginUser);


server.route('/api/expenses')
    .get(protect, getExpenses)
    .post(protect, createExpense);

server.route('/api/expenses/:id')
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.use(express.static(path.join(__dirname, './build')));
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});