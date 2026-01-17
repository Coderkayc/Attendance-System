import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createSession,
  markAttendance,
  endSession,
  sessionReport,
  qrPng,
  getMyAttendance
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(protect);

router.post("/course/:courseId/sessions", authorize("lecturer"), createSession);
router.get("/sessions/:sessionId/qr.png", authorize("lecturer"), qrPng);
router.patch("/sessions/:sessionId/end", authorize("lecturer"), endSession);

router.post("/mark", authorize("student"), markAttendance);
router.get("/me", authorize("student"), getMyAttendance);

router.get("/sessions/:sessionId/report", authorize("admin", "lecturer"), sessionReport);

export default router;
