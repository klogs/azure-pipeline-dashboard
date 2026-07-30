import { Router, Request, Response, NextFunction } from "express";
import { getDashboard } from "../services/dashboardService";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await getDashboard(forceRefresh);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
