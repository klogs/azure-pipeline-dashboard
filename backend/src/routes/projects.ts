import { Router, Request, Response, NextFunction } from "express";
import { getClientFromEnv } from "../azureDevOps/client";
import { listProjects } from "../azureDevOps/projectsApi";
import { getPipelineStatuses } from "../azureDevOps/pipelinesApi";
import { cacheGet, cacheSet } from "../services/cache";

const router = Router();
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const key = "projects:list";
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const client = getClientFromEnv();
    const projects = await listProjects(client);
    cacheSet(key, projects, TTL);
    return res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/:projectId/pipelines",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const key = `pipelines:${projectId}`;
      const cached = cacheGet(key);
      if (cached) return res.json(cached);

      const client = getClientFromEnv();
      const projects = await listProjects(client);
      const project = projects.find((p) => p.id === projectId || p.name === projectId);

      if (!project) return res.status(404).json({ error: "Proje bulunamadı." });

      const statuses = await getPipelineStatuses(client, project.name, project.id);
      cacheSet(key, statuses, TTL);
      return res.json(statuses);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
