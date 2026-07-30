"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
function mapProject(raw) {
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        url: raw.url,
        state: raw.state,
        lastUpdateTime: raw.lastUpdateTime,
    };
}
async function listProjects(client) {
    const response = await client.get("/_apis/projects", {
        params: { "api-version": "7.1" },
    });
    return response.data.value.map(mapProject);
}
//# sourceMappingURL=projectsApi.js.map