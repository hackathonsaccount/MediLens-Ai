import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medilensRouter from "./medilens";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medilensRouter);

export default router;
