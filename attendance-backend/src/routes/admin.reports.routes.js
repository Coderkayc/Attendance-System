import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getAdminAttendanceReports,
  exportAdminAttendanceCsv,
  exportAdminAttendancePdf,
} from "../controllers/admin.reports.controller.js";

const router = express.Router();

router.get("/attendance", protect, authorize("admin"), getAdminAttendanceReports);
router.get("/attendance/export.csv", protect, authorize("admin"), exportAdminAttendanceCsv);
router.get("/attendance/export.pdf", protect, authorize("admin"), exportAdminAttendancePdf);

export default router;
