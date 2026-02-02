import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["active", "closed"], default: "active" },

    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },

    ipRestrictionEnabled: { type: Boolean, default: false },
    allowedCidrs: { type: [String], default: [] }, // e.g. ["102.89.0.0/16", "197.210.0.0/16"] or ["192.168.43.0/24"]
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AttendanceSession", attendanceSessionSchema);



