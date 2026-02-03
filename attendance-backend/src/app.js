import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import adminReportsRoutes from "./routes/admin.reports.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import lecturerReportsRoutes from "./routes/lecturer.reports.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "Attendance API running " }));

app.set("trust proxy", 1);

app.use((req, res, next) => {
  const ip =
    (req.headers["x-forwarded-for"]?.toString().split(",")[0] || "").trim() ||
    req.socket.remoteAddress;

  console.log("🌍 IP:", ip, "|", req.method, req.originalUrl);
  console.log("x-forwarded-for:", req.headers["x-forwarded-for"]);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/lecturer/reports", lecturerReportsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
