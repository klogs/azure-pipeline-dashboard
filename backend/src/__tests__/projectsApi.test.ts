import { listProjects } from "../azureDevOps/projectsApi";
import { AxiosInstance } from "axios";

const mockGet = jest.fn();
const mockClient = { get: mockGet } as unknown as AxiosInstance;

const rawProject = {
  id: "proj-1",
  name: "MyApp",
  description: "Test project",
  url: "https://dev.azure.com/klogs/MyApp",
  state: "wellFormed",
  lastUpdateTime: "2024-01-01T00:00:00Z",
};

beforeEach(() => mockGet.mockReset());

describe("listProjects", () => {
  it("projeleri doğru şekilde eşleştirir", async () => {
    mockGet.mockResolvedValue({ data: { value: [rawProject], count: 1 } });

    const projects = await listProjects(mockClient);

    expect(projects).toHaveLength(1);
    expect(projects[0]).toEqual({
      id: "proj-1",
      name: "MyApp",
      description: "Test project",
      url: "https://dev.azure.com/klogs/MyApp",
      state: "wellFormed",
      lastUpdateTime: "2024-01-01T00:00:00Z",
    });
  });

  it("boş liste döndürdüğünde hata vermez", async () => {
    mockGet.mockResolvedValue({ data: { value: [], count: 0 } });
    const projects = await listProjects(mockClient);
    expect(projects).toEqual([]);
  });
});
