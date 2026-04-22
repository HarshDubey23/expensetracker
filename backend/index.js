const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

/* ===========================
   Middleware
=========================== */
app.use(express.json());
app.use(cors());
app.use(helmet()); // security boost 🔥

/* ===========================
   MongoDB Connection
=========================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ===========================
   Schemas
=========================== */

// 👤 User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// 💸 Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Food", "Travel", "Bills", "Shopping", "Other"],
    default: "Other"
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);

/* ===========================
   Auth Middleware
=========================== */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

/* ===========================
   Routes
=========================== */

/* 🔹 Register */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User Registered" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Login */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login Successful" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Add Expense */
app.post("/api/expense", auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const expense = new Expense({
      userId: req.user.id,
      title,
      amount,
      category
    });

    await expense.save();

    res.status(201).json({ message: "Expense Added", expense });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Get All Expenses */
app.get("/api/expenses", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 });

    res.json(expenses);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Delete Expense (extra marks 🔥) */
app.delete("/api/expense/:id", auth, async (req, res) => {
  try {
    await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ message: "Expense Deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Total Expense (bonus 🔥) */
app.get("/api/expense-total", auth, async (req, res) => {
  try {
    const total = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({ total: total[0]?.total || 0 });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   Server Start
=========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});