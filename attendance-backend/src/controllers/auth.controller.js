import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, matric } = req.body;
  const role = "student";

  if (!name || !email || !password || !matric) {
    res.status(400);
    throw new Error("name, email, password and matric are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("Email already in use");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    matric,
  });

  const token = signToken({ id: user._id });

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("User is inactive");
  }

  const token = signToken({ id: user._id });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
