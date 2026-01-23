import crypto from "crypto";
import QRCode from "qrcode";
import mongoose from "mongoose";

import Course from "../models/Course.js";
import AttendanceSession from "../models/AttendanceSession.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function makeCode() {
  return crypto.randomBytes(16).toString("hex"); 
}

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const createSession = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { durationMinutes = 10 } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!course.lecturer || String(course.lecturer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You are not assigned to this course");
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + Number(durationMinutes) * 60 * 1000);

  const code = makeCode();

  const session = await AttendanceSession.create({
    course: course._id,
    lecturer: req.user._id,
    code,
    startsAt,
    endsAt,
    status: "open"
  });

  const payload = {
    code: session.code,
    courseId: String(course._id)
  };

  const qrText = JSON.stringify(payload);
  const qrDataUrl = await QRCode.toDataURL(qrText);

  res.status(201).json({
    session: {
      id: session._id,
      course: session.course,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      status: session.status
    },
    qr: {
      text: qrText,
      dataUrl: qrDataUrl
    }
  });
});

export const qrPng = async (req, res) => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findById(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.status !== "open") return res.status(400).json({ message: "Session closed" });

  // short-lived token (e.g. 20 seconds)
  const ttlSeconds = 20;
  const jti = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await QrToken.create({ jti, session: session._id, expiresAt });

  const token = jwt.sign(
    { jti, sessionId: String(session._id) },
    process.env.JWT_SECRET,
    { expiresIn: ttlSeconds }
  );

  // student scan link (phone camera opens this)
  const url = `${FRONTEND_URL}/student/scan?token=${encodeURIComponent(token)}`;

  res.setHeader("Content-Type", "image/png");
  const pngBuffer = await QRCode.toBuffer(url, { width: 320, margin: 1 });
  res.send(pngBuffer);
};

export const consumeQrTokenAndMark = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Token required" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(400).json({ message: "QR expired/invalid. Ask lecturer to refresh." });
  }

  const { jti, sessionId } = payload;

  const qr = await QrToken.findOne({ jti });
  if (!qr) return res.status(400).json({ message: "QR expired/invalid." });
  if (qr.usedAt) return res.status(400).json({ message: "QR already used. Rescan." });
  if (qr.expiresAt < new Date()) return res.status(400).json({ message: "QR expired. Rescan." });

  const session = await AttendanceSession.findById(sessionId).populate("course");
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.status !== "open") return res.status(400).json({ message: "Session closed" });

  // mark token as used (single use)
  qr.usedAt = new Date();
  await qr.save();

  // prevent duplicate mark per student per session
  const already = await AttendanceRecord.findOne({
    student: req.user._id,
    session: session._id,
  });

  if (already) {
    return res.json({ message: "Already marked", record: already });
  }

  const record = await AttendanceRecord.create({
    student: req.user._id,
    session: session._id,
    course: session.course?._id,
    status: "present",
    markedAt: new Date(),
  });

  res.status(201).json({
    message: "Attendance marked ✅",
    record,
  });
};

export const markAttendance = asyncHandler(async (req, res) => {
  const { code, courseId } = req.body;

  if (!code || !courseId) {
    res.status(400);
    throw new Error("code and courseId are required");
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    res.status(400);
    throw new Error("Invalid courseId");
  }

  const courseObjId = new mongoose.Types.ObjectId(courseId);

  const session = await AttendanceSession.findOne({ code, course: courseObjId });
  if (!session) {
    res.status(400);
    throw new Error("Invalid QR/session");
  }

  const record = await AttendanceRecord.create({
    session: session._id,
    course: courseId,
    student: req.user._id
  });

  res.status(201).json({
    message: "Attendance marked ✅",
    record
  });
});

export const endSession = async (req, res) => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  session.status = "closed";
  session.endsAt = new Date();
  await session.save();

  res.json({ message: "Session ended successfully" });
};

export const sessionReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findById(sessionId).populate("course");
  if (!session) {
    res.status(404);
    throw new Error("Session not found");
  }

  if (req.user.role === "lecturer" && String(session.lecturer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  const records = await AttendanceRecord.find({ session: sessionId })
    .populate("student", "name email matric")
    .sort({ markedAt: 1 });

  res.json({
    session: {
      id: session._id,
      course: session.course,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      status: session.status
    },
    total: records.length,
    records
  });
});

export const getMyAttendance = async (req, res) => {
  const records = await AttendanceRecord.find({ student: req.user._id })
    .populate("course", "code title")
    .populate("session", "_id")
    .sort({ markedAt: -1 });

  const normalized = records.map((r) => {
    const status = r.status
    ? String(r.status).toLowerCase()
    : r.present === true
    ? "present"
    : r.present === false
    ? "absent"
    : "unknown";

    return {
      _id: r._id,
      course: r.course,
      session: r.session,
      markedAt: r.markedAt,
      status,
    };
  });

  res.json(normalized);
};

