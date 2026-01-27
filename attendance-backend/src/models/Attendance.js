import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
