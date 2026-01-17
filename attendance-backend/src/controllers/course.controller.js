import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCourse = asyncHandler(async (req, res) => {
  const { code, title, unit, department, level, semester, session } = req.body;

  if (!code || !title) {
    res.status(400);
    throw new Error("code and title are required");
  }

  const course = await Course.create({
    code,
    title,
    unit,
    department,
    level,
    semester,
    session
  });

  res.status(201).json(course);
});

export const assignLecturer = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { lecturerId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const lecturer = await User.findById(lecturerId);
  if (!lecturer || lecturer.role !== "lecturer") {
    res.status(400);
    throw new Error("Valid lecturerId is required");
  }

  course.lecturer = lecturer._id;
  await course.save();

  res.json(course);
});

export const listCourses = asyncHandler(async (req, res) => {
  const role = req.user.role;

  let filter = {};
  if (role === "lecturer") filter = { lecturer: req.user._id };

  const courses = await Course.find(filter)
    .populate("lecturer", "name email staffId role")
    .sort({ code: 1 });

  res.json(courses);
});

export const enrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "student") {
    res.status(400);
    throw new Error("Valid studentId is required");
  }

  const enrollment = await Enrollment.create({
    student: student._id,
    course: course._id
  });

  res.status(201).json(enrollment);
});

export const myEnrollments = asyncHandler(async (req, res) => {
  const list = await Enrollment.find({ student: req.user._id })
    .populate("course")
    .sort({ createdAt: -1 });

  res.json(list);
});

export const courseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (req.user.role === "lecturer" && String(course.lecturer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  const list = await Enrollment.find({ course: courseId })
    .populate("student", "name email matric")
    .sort({ createdAt: -1 });

  res.json(list);
});

export const getMyCourses = async (req, res) => {
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
};

export const getEnrolledCourses = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).select("course");
  const courseIds = enrollments.map((e) => e.course);

  const courses = await Course.find({ _id: { $in: courseIds } }).sort({ code: 1 });
  res.json(courses);
};
