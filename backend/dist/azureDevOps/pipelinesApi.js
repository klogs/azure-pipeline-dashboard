"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPipelines = listPipelines;
exports.getRecentBuilds = getRecentBuilds;
exports.getTimeline = getTimeline;
exports.getPipelineStatuses = getPipelineStatuses;
// ---------- Mappers ----------
function mapPipeline(raw, projectId, projectName) {
    return {
        id: raw.id,
        name: raw.name,
        projectId,
        projectName,
        folder: raw.folder ?? "\\",
        url: raw._links.self.href,
    };
}
function mapBuild(raw) {
    return {
        id: raw.id,
        buildNumber: raw.buildNumber,
        status: raw.status,
        result: raw.result,
        queueTime: raw.queueTime,
        startTime: raw.startTime,
        finishTime: raw.finishTime,
        requestedBy: {
            displayName: raw.requestedFor?.displayName ?? "Unknown",
            imageUrl: raw.requestedFor?.imageUrl,
        },
        sourceBranch: raw.sourceBranch,
        triggerInfo: raw.triggerInfo,
        url: raw._links?.web?.href ?? "",
    };
}
function mapTimeline(records) {
    const stages = records
        .filter((r) => r.type === "Stage")
        .sort((a, b) => a.order - b.order)
        .map((r) => ({
        id: r.id,
        name: r.name,
        order: r.order,
        state: r.state,
        result: r.result,
        errorCount: r.errorCount ?? 0,
        issues: (r.issues ?? [])
            .filter((i) => i.type === "error" || i.type === "warning")
            .map((i) => ({ type: i.type, message: i.message }))
            .slice(0, 5), // en fazla 5 issue
    }));
    // Stage'lerin issue'ları yoksa, başarısız job'lardan topla
    if (stages.some((s) => s.result === "failed" && s.issues.length === 0)) {
        const failedJobs = records.filter((r) => (r.type === "Job" || r.type === "Task") &&
            r.result === "failed" &&
            (r.issues?.length ?? 0) > 0);
        for (const stage of stages) {
            if (stage.result !== "failed")
                continue;
            const stageJobs = failedJobs.filter((j) => {
                // job'un parent zincirini takip ederek stage'e bağlı mı kontrol et
                let cur = j;
                while (cur?.parentId) {
                    if (cur.parentId === stage.id)
                        return true;
                    cur = records.find((r) => r.id === cur.parentId);
                }
                return false;
            });
            stage.issues = stageJobs
                .flatMap((j) => j.issues ?? [])
                .filter((i) => i.type === "error")
                .map((i) => ({ type: "error", message: i.message }))
                .slice(0, 5);
        }
    }
    return { stages };
}
// ---------- API calls ----------
async function listPipelines(client, projectName, projectId) {
    const response = await client.get(`/${encodeURIComponent(projectName)}/_apis/pipelines`, { params: { "api-version": "7.1" } });
    return response.data.value.map((r) => mapPipeline(r, projectId, projectName));
}
async function getRecentBuilds(client, projectName, definitionId, top = 5) {
    const response = await client.get(`/${encodeURIComponent(projectName)}/_apis/build/builds`, {
        params: {
            "api-version": "7.1",
            definitions: definitionId,
            $top: top,
            queryOrder: "queueTimeDescending",
        },
    });
    return response.data.value.map(mapBuild);
}
async function getTimeline(client, projectName, buildId) {
    try {
        const response = await client.get(`/${encodeURIComponent(projectName)}/_apis/build/builds/${buildId}/timeline`, { params: { "api-version": "7.1" } });
        const records = response.data?.records ?? [];
        if (records.length === 0)
            return undefined;
        return mapTimeline(records);
    }
    catch {
        return undefined; // timeline yoksa sessizce geç
    }
}
async function getPipelineStatuses(client, projectName, projectId) {
    const pipelines = await listPipelines(client, projectName, projectId);
    const results = [];
    const CHUNK = 5;
    for (let i = 0; i < pipelines.length; i += CHUNK) {
        const chunk = pipelines.slice(i, i + CHUNK);
        const chunkResults = await Promise.all(chunk.map(async (pipeline) => {
            const recentBuilds = await getRecentBuilds(client, projectName, pipeline.id);
            const lastBuild = recentBuilds[0];
            // Timeline yalnızca çalışan veya başarısız build'ler için çek
            let timeline;
            if (lastBuild && (lastBuild.status === "inProgress" || lastBuild.result === "failed")) {
                timeline = await getTimeline(client, projectName, lastBuild.id);
            }
            return { pipeline, lastBuild, recentBuilds, timeline };
        }));
        results.push(...chunkResults);
    }
    return results;
}
//# sourceMappingURL=pipelinesApi.js.map