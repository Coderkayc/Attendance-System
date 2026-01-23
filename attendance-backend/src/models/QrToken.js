import mongoose from "mongoose";

const qrTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true }, // token id
    session: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

qrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("QrToken", qrTokenSchema);

