import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["active", "closed"], default: "active" },

    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },

    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AttendanceSession", attendanceSessionSchema);


