import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createCourse,
  assignLecturer,
  listCourses,
  enrollStudent,
  myEnrollments,
  courseEnrollments,
  getMyCourses,
  getEnrolledCourses
} from "../controllers/course.controller.js";

const router = Router();

router.use(protect);

router.get("/", listCourses);

router.post("/", authorize("admin"), createCourse);
router.patch("/:courseId/assign-lecturer", authorize("admin"), assignLecturer);

router.post("/:courseId/enroll", authorize("admin"), enrollStudent);

router.get("/me/enrollments", authorize("student"), myEnrollments);
router.get("/:courseId/enrollments", authorize("admin", "lecturer"), courseEnrollments);
router.get("/my", authorize("lecturer"), getMyCourses);
router.get("/enrolled", authorize("student"), getEnrolledCourses);

export default router;
