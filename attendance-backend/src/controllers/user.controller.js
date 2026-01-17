import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json(user);
});

export const listUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) filter.role = role; // "admin" | "lecturer" | "student"

    const users = await User.find(filter)
      .select("_id name email role")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
