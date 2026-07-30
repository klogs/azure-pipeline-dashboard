"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "test";
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
const client = __importStar(require("../../azureDevOps/client"));
const projectsApi = __importStar(require("../../azureDevOps/projectsApi"));
const pipelinesApi = __importStar(require("../../azureDevOps/pipelinesApi"));
const cache_1 = require("../../services/cache");
jest.mock("../../azureDevOps/client");
jest.mock("../../azureDevOps/projectsApi");
jest.mock("../../azureDevOps/pipelinesApi");
const mockProject = {
    id: "proj-1",
    name: "MyApp",
    url: "https://dev.azure.com/klogs/MyApp",
    state: "wellFormed",
    lastUpdateTime: "2024-01-01T00:00:00Z",
};
const mockPipeline = {
    id: 42,
    name: "CI Build",
    projectId: "proj-1",
    projectName: "MyApp",
    folder: "\\",
    url: "https://dev.azure.com/klogs/MyApp/_apis/pipelines/42",
};
const mockBuild = {
    id: 101,
    buildNumber: "20240101.1",
    status: "completed",
    result: "succeeded",
    queueTime: "2024-01-01T10:00:00Z",
    requestedBy: { displayName: "Alice" },
    sourceBranch: "refs/heads/main",
    url: "https://dev.azure.com/klogs/MyApp/_build/results?buildId=101",
};
beforeEach(() => {
    jest.resetAllMocks();
    (0, cache_1.cacheClear)();
    client.getClientFromEnv.mockReturnValue({});
    projectsApi.listProjects.mockResolvedValue([mockProject]);
    pipelinesApi.listPipelines.mockResolvedValue([mockPipeline]);
    pipelinesApi.getRecentBuilds.mockResolvedValue([mockBuild]);
});
describe("GET /api/pipelines/:id/status", () => {
    it("?project parametresi olmadan 400 döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/pipelines/42/status");
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/project/);
    });
    it("geçersiz proje adı için 404 döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/pipelines/42/status?project=Nonexistent");
        expect(res.status).toBe(404);
    });
    it("geçersiz pipelineId için 404 döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/pipelines/999/status?project=MyApp");
        expect(res.status).toBe(404);
    });
    it("pipeline durumunu başarıyla döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/pipelines/42/status?project=MyApp");
        expect(res.status).toBe(200);
        expect(res.body.pipeline.name).toBe("CI Build");
        expect(res.body.lastBuild.result).toBe("succeeded");
        expect(res.body.recentBuilds).toHaveLength(1);
    });
});
describe("GET /api/projects/:projectId/pipelines", () => {
    it("projeye ait pipeline durumlarını döndürür", async () => {
        pipelinesApi.getPipelineStatuses.mockResolvedValue([
            { pipeline: mockPipeline, lastBuild: mockBuild, recentBuilds: [mockBuild] },
        ]);
        const res = await (0, supertest_1.default)(index_1.default).get("/api/projects/proj-1/pipelines");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].pipeline.name).toBe("CI Build");
    });
});
//# sourceMappingURL=pipelines.test.js.map