import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    tokenHash: { type: String, required: true, index: true, unique: true },
    expiresAt: { type: Date, required: true },

    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AttendanceSession", attendanceSessionSchema);

