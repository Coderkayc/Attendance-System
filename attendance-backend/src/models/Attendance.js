import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);

