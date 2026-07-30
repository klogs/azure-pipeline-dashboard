import { listPipelines, getRecentBuilds } from "../azureDevOps/pipelinesApi";
import { AxiosInstance } from "axios";

const mockGet = jest.fn();
const mockClient = { get: mockGet } as unknown as AxiosInstance;

const rawPipeline = {
  id: 1,
  name: "CI Build",
  folder: "\\",
  _links: { self: { href: "https://dev.azure.com/klogs/MyApp/_apis/pipelines/1" } },
};

const rawBuild = {
  id: 101,
  buildNumber: "20240101.1",
  status: "completed",
  result: "succeeded",
  queueTime: "2024-01-01T10:00:00Z",
  startTime: "2024-01-01T10:01:00Z",
  finishTime: "2024-01-01T10:05:00Z",
  requestedFor: { displayName: "Alice", imageUrl: undefined },
  sourceBranch: "refs/heads/main",
  triggerInfo: {},
  _links: { web: { href: "https://dev.azure.com/klogs/MyApp/_build/results?buildId=101" } },
  definition: { id: 1 },
};

beforeEach(() => mockGet.mockReset());

describe("listPipelines", () => {
  it("pipeline'ları doğru eşleştirir", async () => {
    mockGet.mockResolvedValue({ data: { value: [rawPipeline], count: 1 } });
    const pipelines = await listPipelines(mockClient, "MyApp", "proj-1");

    expect(pipelines).toHaveLength(1);
    expect(pipelines[0]).toMatchObject({
      id: 1,
      name: "CI Build",
      projectId: "proj-1",
      projectName: "MyApp",
    });
  });
});

describe("getRecentBuilds", () => {
  it("build'leri doğru eşleştirir", async () => {
    mockGet.mockResolvedValue({ data: { value: [rawBuild], count: 1 } });
    const builds = await getRecentBuilds(mockClient, "MyApp", 1);

    expect(builds).toHaveLength(1);
    expect(builds[0]).toMatchObject({
      id: 101,
      buildNumber: "20240101.1",
      status: "completed",
      result: "succeeded",
      requestedBy: { displayName: "Alice" },
    });
  });
});
