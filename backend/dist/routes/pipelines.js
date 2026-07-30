"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../azureDevOps/client");
const projectsApi_1 = require("../azureDevOps/projectsApi");
const pipelinesApi_1 = require("../azureDevOps/pipelinesApi");
const cache_1 = require("../services/cache");
const router = (0, express_1.Router)();
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);
// GET /api/pipelines/:pipelineId/status?project=<name|id>
router.get("/:pipelineId/status", async (req, res, next) => {
    try {
        const { pipelineId } = req.params;
        const projectParam = req.query.project;
        if (!projectParam) {
            return res.status(400).json({ error: "?project sorgu parametresi zorunludur." });
        }
        const cacheKey = `pipeline:${projectParam}:${pipelineId}`;
        const cached = (0, cache_1.cacheGet)(cacheKey);
        if (cached)
            return res.json(cached);
        const client = (0, client_1.getClientFromEnv)();
        const projects = await (0, projectsApi_1.listProjects)(client);
        const project = projects.find((p) => p.id === projectParam || p.name === projectParam);
        if (!project) {
            return res.status(404).json({ error: `'${projectParam}' projesi bulunamadı.` });
        }
        const pipelines = await (0, pipelinesApi_1.listPipelines)(client, project.name, project.id);
        const pipeline = pipelines.find((p) => p.id === Number(pipelineId));
        if (!pipeline) {
            return res.status(404).json({ error: `Pipeline #${pipelineId} bulunamadı.` });
        }
        const recentBuilds = await (0, pipelinesApi_1.getRecentBuilds)(client, project.name, pipeline.id);
        const result = { pipeline, lastBuild: recentBuilds[0] ?? null, recentBuilds };
        (0, cache_1.cacheSet)(cacheKey, result, TTL);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=pipelines.js.map