import { Router, Request, Response, NextFunction } from "express";
import { getClientFromEnv } from "../azureDevOps/client";
import { listProjects } from "../azureDevOps/projectsApi";
import { getRecentBuilds, listPipelines } from "../azureDevOps/pipelinesApi";
import { cacheGet, cacheSet } from "../services/cache";

const router = Router();
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);

// GET /api/pipelines/:pipelineId/status?project=<name|id>
router.get(
  "/:pipelineId/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineId } = req.params;
      const projectParam = req.query.project as string | undefined;

      if (!projectParam) {
        return res.status(400).json({ error: "?project sorgu parametresi zorunludur." });
      }

      const cacheKey = `pipeline:${projectParam}:${pipelineId}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      const client = getClientFromEnv();
      const projects = await listProjects(client);
      const project = projects.find((p) => p.id === projectParam || p.name === projectParam);

      if (!project) {
        return res.status(404).json({ error: `'${projectParam}' projesi bulunamadı.` });
      }

      const pipelines = await listPipelines(client, project.name, project.id);
      const pipeline = pipelines.find((p) => p.id === Number(pipelineId));

      if (!pipeline) {
        return res.status(404).json({ error: `Pipeline #${pipelineId} bulunamadı.` });
      }

      const recentBuilds = await getRecentBuilds(client, project.name, pipeline.id);
      const result = { pipeline, lastBuild: recentBuilds[0] ?? null, recentBuilds };

      cacheSet(cacheKey, result, TTL);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
