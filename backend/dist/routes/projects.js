"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../azureDevOps/client");
const projectsApi_1 = require("../azureDevOps/projectsApi");
const pipelinesApi_1 = require("../azureDevOps/pipelinesApi");
const cache_1 = require("../services/cache");
const router = (0, express_1.Router)();
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);
router.get("/", async (_req, res, next) => {
    try {
        const key = "projects:list";
        const cached = (0, cache_1.cacheGet)(key);
        if (cached)
            return res.json(cached);
        const client = (0, client_1.getClientFromEnv)();
        const projects = await (0, projectsApi_1.listProjects)(client);
        (0, cache_1.cacheSet)(key, projects, TTL);
        return res.json(projects);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:projectId/pipelines", async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const key = `pipelines:${projectId}`;
        const cached = (0, cache_1.cacheGet)(key);
        if (cached)
            return res.json(cached);
        const client = (0, client_1.getClientFromEnv)();
        const projects = await (0, projectsApi_1.listProjects)(client);
        const project = projects.find((p) => p.id === projectId || p.name === projectId);
        if (!project)
            return res.status(404).json({ error: "Proje bulunamadı." });
        const statuses = await (0, pipelinesApi_1.getPipelineStatuses)(client, project.name, project.id);
        (0, cache_1.cacheSet)(key, statuses, TTL);
        return res.json(statuses);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map