process.env.NODE_ENV = "test";
import request from "supertest";
import app from "../../index";
import * as dashboardService from "../../services/dashboardService";

jest.mock("../../services/dashboardService");

const mockSummary = [
  {
    projectName: "MyApp",
    projectId: "proj-1",
    pipelines: [],
    stats: { total: 0, succeeded: 0, failed: 0, running: 0, other: 0 },
  },
];

beforeEach(() => {
  jest.resetAllMocks();
  (dashboardService.getDashboard as jest.Mock).mockResolvedValue(mockSummary);
});

describe("GET /api/dashboard", () => {
  it("dashboard özetini döndürür", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].projectName).toBe("MyApp");
  });

  it("?refresh=true ile forceRefresh=true geçirir", async () => {
    await request(app).get("/api/dashboard?refresh=true");
    expect(dashboardService.getDashboard).toHaveBeenCalledWith(true);
  });

  it("?refresh olmadan forceRefresh=false geçirir", async () => {
    await request(app).get("/api/dashboard");
    expect(dashboardService.getDashboard).toHaveBeenCalledWith(false);
  });
});
