"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
const client_1 = require("../azureDevOps/client");
const projectsApi_1 = require("../azureDevOps/projectsApi");
const pipelinesApi_1 = require("../azureDevOps/pipelinesApi");
const cache_1 = require("./cache");
const CACHE_KEY = "dashboard:all";
const TTL = Number(process.env.CACHE_TTL_SECONDS ?? 30);
function computeStats(pipelines) {
    let succeeded = 0, failed = 0, running = 0, other = 0;
    for (const { lastBuild } of pipelines) {
        if (!lastBuild) {
            other++;
            continue;
        }
        if (lastBuild.status === "inProgress") {
            running++;
            continue;
        }
        switch (lastBuild.result) {
            case "succeeded":
                succeeded++;
                break;
            case "failed":
                failed++;
                break;
            default: other++;
        }
    }
    return { total: pipelines.length, succeeded, failed, running, other };
}
async function getDashboard(forceRefresh = false) {
    if (!forceRefresh) {
        const cached = (0, cache_1.cacheGet)(CACHE_KEY);
        if (cached)
            return cached;
    }
    const client = (0, client_1.getClientFromEnv)();
    const projects = await (0, projectsApi_1.listProjects)(client);
    const summaries = await Promise.all(projects.map(async (project) => {
        const pipelines = await (0, pipelinesApi_1.getPipelineStatuses)(client, project.name, project.id);
        return {
            projectName: project.name,
            projectId: project.id,
            pipelines,
            stats: computeStats(pipelines),
        };
    }));
    (0, cache_1.cacheSet)(CACHE_KEY, summaries, TTL);
    return summaries;
}
//# sourceMappingURL=dashboardService.js.map