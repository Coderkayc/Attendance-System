import AttendanceRecord from "../models/AttendanceRecord.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

function buildFilter(q) {
  const filter = {};

  if (q.courseId) filter.course = q.courseId;

  if (q.status) {
    const s = String(q.status).toLowerCase();
    if (s === "present" || s === "absent") filter.status = s;
  }

  if (q.from || q.to) {
    filter.markedAt = {};
    if (q.from) filter.markedAt.$gte = new Date(q.from);
    if (q.to) {
      const end = new Date(q.to);
      end.setHours(23, 59, 59, 999);
      filter.markedAt.$lte = end;
    }
  }

  return filter;
}

export const getAdminAttendanceReports = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));

    const filter = buildFilter(req.query);

    const total = await AttendanceRecord.countDocuments(filter);

    const records = await AttendanceRecord.find(filter)
      .populate("course", "code title")
      .populate("student", "name email matric")
      .populate("session", "_id")
      .sort({ markedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      records,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to load reports" });
  }
};

export const exportAdminAttendanceCsv = async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const records = await AttendanceRecord.find(filter)
      .populate("course", "code title")
      .populate("student", "name email matric")
      .sort({ markedAt: -1 });

    const rows = records.map((r) => ({
      courseCode: r.course?.code || "",
      courseTitle: r.course?.title || "",
      studentName: r.student?.name || "",
      studentEmail: r.student?.email || "",
      matric: r.student?.matric || "",
      status: String(r.status || "").toLowerCase(),
      markedAt: r.markedAt ? new Date(r.markedAt).toISOString() : "",
    }));

    const parser = new Parser({
      fields: ["courseCode", "courseTitle", "studentName", "studentEmail", "matric", "status", "markedAt"],
    });

    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="attendance-report.csv"`);
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to export CSV" });
  }
};

export const exportAdminAttendancePdf = async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const records = await AttendanceRecord.find(filter)
      .populate("course", "code title")
      .populate("student", "name email matric")
      .sort({ markedAt: -1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="attendance-report.pdf"`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("Attendance Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#555").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    doc.fillColor("#000").fontSize(11);
    const y = doc.y;
    doc.text("Course", 40, y);
    doc.text("Student", 170, y);
    doc.text("Status", 360, y);
    doc.text("Marked At", 430, y);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

    doc.fontSize(10);

    for (const r of records) {
      const rowY = doc.y + 6;

      doc.text(r.course?.code || "", 40, rowY, { width: 120 });
      doc.text(r.student?.name || "", 170, rowY, { width: 180 });
      doc.text(String(r.status || "").toLowerCase(), 360, rowY, { width: 60 });
      doc.text(r.markedAt ? new Date(r.markedAt).toLocaleString() : "", 430, rowY, { width: 120 });

      doc.moveDown(1);

      if (doc.y > 760) doc.addPage();
    }

    doc.end();
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to export PDF" });
  }
};
