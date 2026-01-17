import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    title: { type: String, required: true, trim: true },
    unit: { type: Number, default: 2 },
    department: { type: String, trim: true },
    level: { type: Number, default: 400 },
    semester: { type: String, enum: ["first", "second"], default: "first" },
    session: { type: String, default: "2025/2026" },

    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
