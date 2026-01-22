import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getLecturerAttendanceReports,
  exportLecturerAttendanceCsv,
  exportLecturerAttendancePdf,
} from "../controllers/lecturer.reports.controller.js";

const router = express.Router();

router.get("/attendance",
  protect,
  authorize("lecturer"),
  getLecturerAttendanceReports
);

router.get(
  "/attendance/export.csv",
  protect,
  authorize("lecturer"),
  exportLecturerAttendanceCsv
);

router.get(
  "/attendance/export.pdf",
  protect,
  authorize("lecturer"),
  exportLecturerAttendancePdf
);

export default router;
