import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { registerClient, unregisterClient } from "../services/sseService";

const router = Router();

// GET /api/stream — Server-Sent Events endpoint
router.get("/", (req: Request, res: Response) => {
  const clientId = randomUUID();
  registerClient(clientId, res);

  // Clean up on disconnect
  req.on("close", () => {
    unregisterClient(clientId);
  });
});

export default router;
