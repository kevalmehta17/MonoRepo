import jwt from "jsonwebtoken";
import express from 'express';
import { authenticateJwt, SECRET } from "../middleware/";
import { User } from "../db";
import { signupInput } from "@kevalmehta/common";
const router = express.Router();



// Signup

router.post('/signup', async (req, res) => {
  // const { username, password } = req.body;

  // Validate input through the package i published on npm (common)
  let parsedInput = signupInput.safeParse(req.body)

  if (!parsedInput.success) {
    res.status(403).json({ message: "Invalid input" }) //403 for forbidden
  }

  const username = parsedInput.data?.username;
  const password = parsedInput.data?.password;

  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'User created successfully', token });
  }
});

// Login

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

router.get('/me', authenticateJwt, async (req, res) => {
  const userId = req.headers["userId"];
  const user = await User.findOne({ _id: userId });
  if (user) {
    res.json({ username: user.username });
  } else {
    res.status(403).json({ message: 'User not logged in' });
  }
});

export default router;
