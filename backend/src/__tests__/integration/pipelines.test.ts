process.env.NODE_ENV = "test";
import request from "supertest";
import app from "../../index";
import * as client from "../../azureDevOps/client";
import * as projectsApi from "../../azureDevOps/projectsApi";
import * as pipelinesApi from "../../azureDevOps/pipelinesApi";
import { cacheClear } from "../../services/cache";
import { AxiosInstance } from "axios";

jest.mock("../../azureDevOps/client");
jest.mock("../../azureDevOps/projectsApi");
jest.mock("../../azureDevOps/pipelinesApi");

const mockProject = {
  id: "proj-1",
  name: "MyApp",
  url: "https://dev.azure.com/klogs/MyApp",
  state: "wellFormed" as const,
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
  cacheClear();
  (client.getClientFromEnv as jest.Mock).mockReturnValue({} as AxiosInstance);
  (projectsApi.listProjects as jest.Mock).mockResolvedValue([mockProject]);
  (pipelinesApi.listPipelines as jest.Mock).mockResolvedValue([mockPipeline]);
  (pipelinesApi.getRecentBuilds as jest.Mock).mockResolvedValue([mockBuild]);
});

describe("GET /api/pipelines/:id/status", () => {
  it("?project parametresi olmadan 400 döndürür", async () => {
    const res = await request(app).get("/api/pipelines/42/status");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/project/);
  });

  it("geçersiz proje adı için 404 döndürür", async () => {
    const res = await request(app).get("/api/pipelines/42/status?project=Nonexistent");
    expect(res.status).toBe(404);
  });

  it("geçersiz pipelineId için 404 döndürür", async () => {
    const res = await request(app).get("/api/pipelines/999/status?project=MyApp");
    expect(res.status).toBe(404);
  });

  it("pipeline durumunu başarıyla döndürür", async () => {
    const res = await request(app).get("/api/pipelines/42/status?project=MyApp");
    expect(res.status).toBe(200);
    expect(res.body.pipeline.name).toBe("CI Build");
    expect(res.body.lastBuild.result).toBe("succeeded");
    expect(res.body.recentBuilds).toHaveLength(1);
  });
});

describe("GET /api/projects/:projectId/pipelines", () => {
  it("projeye ait pipeline durumlarını döndürür", async () => {
    (pipelinesApi.getPipelineStatuses as jest.Mock).mockResolvedValue([
      { pipeline: mockPipeline, lastBuild: mockBuild, recentBuilds: [mockBuild] },
    ]);

    const res = await request(app).get("/api/projects/proj-1/pipelines");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].pipeline.name).toBe("CI Build");
  });
});
