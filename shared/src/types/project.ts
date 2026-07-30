export interface AzureProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: "wellFormed" | "createPending" | "deleting" | "new" | "unchanged";
  lastUpdateTime: string;
}
