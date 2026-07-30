process.env.NODE_ENV = "test";
import request from "supertest";
import app from "../../index";
import * as projectsApi from "../../azureDevOps/projectsApi";
import * as client from "../../azureDevOps/client";
import { cacheClear } from "../../services/cache";
import { AxiosInstance } from "axios";

jest.mock("../../azureDevOps/client");
jest.mock("../../azureDevOps/projectsApi");

const mockProject = {
  id: "proj-1",
  name: "MyApp",
  url: "https://dev.azure.com/klogs/MyApp",
  state: "wellFormed" as const,
  lastUpdateTime: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.resetAllMocks();
  cacheClear();
  (client.getClientFromEnv as jest.Mock).mockReturnValue({} as AxiosInstance);
  (projectsApi.listProjects as jest.Mock).mockResolvedValue([mockProject]);
});

describe("GET /api/projects", () => {
  it("proje listesini döndürür", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("MyApp");
  });

  it("Azure API hatası durumunda hata yanıtı döndürür", async () => {
    const axiosError = Object.assign(new Error("Upstream error"), {
      isAxiosError: true,
      response: { status: 401, data: { message: "Unauthorized" }, headers: {} },
    });
    (projectsApi.listProjects as jest.Mock).mockRejectedValue(axiosError);

    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Azure DevOps API hatası");
  });
});
