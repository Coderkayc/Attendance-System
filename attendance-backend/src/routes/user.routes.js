import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { listUsers, toggleActive } from "../controllers/user.controller.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/", authorize("admin"), listUsers);
router.patch("/:id/toggle-active", toggleActive);

export default router;
