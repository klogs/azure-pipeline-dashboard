import axios, { AxiosInstance, AxiosError } from "axios";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

function buildAuthHeader(pat: string): string {
  return "Basic " + Buffer.from(`:${pat}`).toString("base64");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAzureDevOpsClient(org: string, pat: string): AxiosInstance {
  const instance = axios.create({
    baseURL: `https://dev.azure.com/${org}`,
    headers: {
      Authorization: buildAuthHeader(pat),
      "Content-Type": "application/json",
    },
    timeout: 10_000,
  });

  // Exponential backoff retry interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as typeof error.config & { _retryCount?: number };
      if (!config) return Promise.reject(error);

      config._retryCount = (config._retryCount ?? 0) + 1;

      const status = error.response?.status;
      const shouldRetry =
        config._retryCount <= MAX_RETRIES &&
        (status === 429 || status === 503 || error.code === "ECONNRESET");

      if (!shouldRetry) return Promise.reject(error);

      const retryAfter =
        status === 429
          ? Number(error.response?.headers["retry-after"] ?? 0) * 1000
          : BASE_DELAY_MS * 2 ** (config._retryCount - 1);

      await delay(retryAfter);
      return instance(config);
    }
  );

  return instance;
}

export function getClientFromEnv(): AxiosInstance {
  const org = process.env.AZURE_DEVOPS_ORG;
  const pat = process.env.AZURE_DEVOPS_PAT;
  if (!org || !pat) {
    throw new Error("AZURE_DEVOPS_ORG ve AZURE_DEVOPS_PAT ortam değişkenleri zorunludur.");
  }
  return createAzureDevOpsClient(org, pat);
}
