import { Request, Response, NextFunction } from "express";
import axios from "axios";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 502;
    const message = err.response?.data?.message ?? err.message;
    res.status(status).json({ error: "Azure DevOps API hatası", detail: message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Bilinmeyen sunucu hatası" });
}
