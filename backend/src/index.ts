import dotenv from "dotenv";
import path from "path";
// .env monorepo kökünde (backend/ → ../)
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects";
import dashboardRouter from "./routes/dashboard";
import pipelinesRouter from "./routes/pipelines";
import streamRouter from "./routes/stream";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/projects", projectsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/pipelines", pipelinesRouter);
app.use("/api/stream", streamRouter);

app.use(errorHandler);

// Sunucuyu yalnızca doğrudan çalıştırıldığında başlat (test ortamında çağrılmaz)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;
