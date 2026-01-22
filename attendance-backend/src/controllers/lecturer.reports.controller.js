import AttendanceRecord from "../models/AttendanceRecord.js";
import Course from "../models/Course.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

function normalizeStatus(r) {
  if (r.status) return String(r.status).toLowerCase();
  if (r.present === true) return "present";
  if (r.present === false) return "absent";
  return "unknown";
}

function buildFilters(query) {
  const { from, to, status, courseId } = query;

  const filter = {};

  if (courseId) filter.course = courseId;

  if (from || to) {
    filter.markedAt = {};
    if (from) filter.markedAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.markedAt.$lte = end;
    }
  }

  if (status && status !== "all") {
    filter.status = status; 
  }

  return { filter, status };
}

async function getLecturerCourseIds(lecturerUserId) {
  const courses = await Course.find({ lecturer: lecturerUserId }).select("_id");
  return courses.map((c) => c._id);
}

async function queryLecturerReports(req) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "25", 10)));
  const skip = (page - 1) * limit;

  const lecturerCourseIds = await getLecturerCourseIds(req.user._id);

  if (!lecturerCourseIds.length) {
    return { items: [], total: 0, page, limit };
  }

  const { filter, status: statusQuery } = buildFilters(req.query);

  filter.course = filter.course
    ? filter.course 
    : { $in: lecturerCourseIds };

  if (req.query.courseId) {
    const ok = lecturerCourseIds.some((id) => String(id) === String(req.query.courseId));
    if (!ok) {
      return { items: [], total: 0, page, limit };
    }
  }

  const raw = await AttendanceRecord.find(filter)
    .populate("course", "code title")
    .populate("student", "name email matric")
    .populate("session", "_id")
    .sort({ markedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AttendanceRecord.countDocuments(filter);

  let items = raw.map((r) => ({
    _id: r._id,
    course: r.course,
    student: r.student,
    session: r.session,
    markedAt: r.markedAt,
    status: normalizeStatus(r),
  }));

  if (statusQuery && statusQuery !== "all") {
    items = items.filter((x) => x.status === statusQuery);
  }

  return { items, total, page, limit };
}

export const getLecturerAttendanceReports = async (req, res) => {
  const data = await queryLecturerReports(req);
  res.json(data);
};

export const exportLecturerAttendanceCsv = async (req, res) => {
  const { items } = await queryLecturerReports(req);

  const rows = items.map((r) => ({
    Course: `${r.course?.code || ""} - ${r.course?.title || ""}`,
    Student: r.student?.name || "",
    Email: r.student?.email || "",
    Matric: r.student?.matric || "",
    Status: r.status,
    MarkedAt: r.markedAt ? new Date(r.markedAt).toISOString() : "",
    SessionId: r.session?._id || "",
  }));

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="lecturer-attendance.csv"');
  res.send(csv);
};

export const exportLecturerAttendancePdf = async (req, res) => {
  const { items } = await queryLecturerReports(req);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="lecturer-attendance.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(16).text("Lecturer Attendance Report", { bold: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#444").text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  doc.fillColor("#000");

  items.forEach((r, idx) => {
    const courseLine = `${r.course?.code || ""} — ${r.course?.title || ""}`;
    const studentLine = `${r.student?.name || ""} (${r.student?.email || ""})`;
    const statusLine = `Status: ${r.status}`;
    const timeLine = `Marked At: ${r.markedAt ? new Date(r.markedAt).toLocaleString() : ""}`;

    doc.fontSize(11).text(`${idx + 1}. ${courseLine}`);
    doc.fontSize(10).text(studentLine);
    doc.fontSize(10).text(statusLine);
    doc.fontSize(10).text(timeLine);
    doc.moveDown(0.7);
  });

  doc.end();
};
