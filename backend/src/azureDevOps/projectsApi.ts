import { AxiosInstance } from "axios";
import { AzureProject } from "@klogs/shared";

interface AzureProjectsResponse {
  value: RawProject[];
  count: number;
}

interface RawProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
  lastUpdateTime: string;
}

function mapProject(raw: RawProject): AzureProject {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    url: raw.url,
    state: raw.state as AzureProject["state"],
    lastUpdateTime: raw.lastUpdateTime,
  };
}

export async function listProjects(client: AxiosInstance): Promise<AzureProject[]> {
  const response = await client.get<AzureProjectsResponse>("/_apis/projects", {
    params: { "api-version": "7.1" },
  });
  return response.data.value.map(mapProject);
}
