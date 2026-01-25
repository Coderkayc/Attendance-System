import User from "../models/User.js";

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, matric, staffId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password, role are required",
      });
    }

    const allowed = ["admin", "lecturer", "student"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (role === "student" && !matric) {
      return res.status(400).json({ message: "matric is required for student" });
    }

    if (role === "lecturer" && !staffId) {
      return res.status(400).json({ message: "staffId is required for lecturer" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      matric: role === "student" ? String(matric).trim() : undefined,
      staffId: role === "lecturer" ? String(staffId).trim() : undefined,
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("adminCreateUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
