import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import studentsRouter from "./students.js";
import dashboardRouter from "./dashboard.js";
import alertsRouter from "./alerts.js";
import institutesRouter from "./institutes.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/students", studentsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/alerts", alertsRouter);
router.use("/institutes", institutesRouter);

export default router;
