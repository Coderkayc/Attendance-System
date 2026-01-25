import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import { adminCreateUser } from "../controllers/admin.controller.js";

const router = Router();

router.post("/users", protect, authorize("admin"), adminCreateUser);

export default router;
