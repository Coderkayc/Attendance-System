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
  const { ttlMinutes = 10 } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (String(course.lecturer) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your course" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + Number(ttlMinutes) * 60 * 1000);

  const session = await AttendanceSession.create({
    course: course._id,
    lecturer: req.user._id,
    tokenHash,
    expiresAt,
    status: "active",
  });

  return res.status(201).json({
    sessionId: session._id,
    token,
    expiresAt: session.expiresAt,
  });
});

export const qrPng = async (req, res) => {
  const { sessionId } = req.params;
  const token = String(req.query.token || "");

  if (!token) return res.status(400).json({ message: "Missing token" });

  const session = await AttendanceSession.findById(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  if (session.status !== "active") {
    return res.status(400).json({ message: "Session is not active" });
  }

  if (new Date() > new Date(session.expiresAt)) {
    return res.status(400).json({ message: "Session expired" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (tokenHash !== session.tokenHash) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const frontend = process.env.FRONTEND_URL;
  if (!frontend) return res.status(500).json({ message: "FRONTEND_URL not set" });

  const scanUrl = `${frontend}/student/scan?token=${token}`;

  const png = await QRCode.toBuffer(scanUrl, { type: "png", width: 320 });

  res.setHeader("Content-Type", "image/png");
  res.send(png);
};

export const consumeQrTokenAndMark = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: "Missing token" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const session = await AttendanceSession.findOne({ tokenHash });

    if (!session) return res.status(404).json({ message: "Invalid/expired session" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Session closed" });
    }

    if (new Date() > new Date(session.expiresAt)) {
      return res.status(400).json({ message: "Session expired" });
    }

    const course = await Course.findById(session.course);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const exists = await Attendance.findOne({
      session: session._id,
      student: req.user._id,
    });

    if (exists) {
      return res.status(200).json({ message: "Already marked ✅" });
    }

    await Attendance.create({
      session: session._id,
      course: session.course,
      student: req.user._id,
      lecturer: session.lecturer,
      markedAt: new Date(),
    });

    return res.status(201).json({ message: "Attendance marked ✅" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
}

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
  if (!session) return res.status(404).json({ message: "Session not found" });

  if (String(session.lecturer) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your session" });
  }

  session.status = "closed";
  session.endedAt = new Date();
  await session.save();

  return res.json({ message: "Session ended", sessionId: session._id });
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

