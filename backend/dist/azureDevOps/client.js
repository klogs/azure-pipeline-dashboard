"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAzureDevOpsClient = createAzureDevOpsClient;
exports.getClientFromEnv = getClientFromEnv;
const axios_1 = __importDefault(require("axios"));
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
function buildAuthHeader(pat) {
    return "Basic " + Buffer.from(`:${pat}`).toString("base64");
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createAzureDevOpsClient(org, pat) {
    const instance = axios_1.default.create({
        baseURL: `https://dev.azure.com/${org}`,
        headers: {
            Authorization: buildAuthHeader(pat),
            "Content-Type": "application/json",
        },
        timeout: 10000,
    });
    // Exponential backoff retry interceptor
    instance.interceptors.response.use((response) => response, async (error) => {
        const config = error.config;
        if (!config)
            return Promise.reject(error);
        config._retryCount = (config._retryCount ?? 0) + 1;
        const status = error.response?.status;
        const shouldRetry = config._retryCount <= MAX_RETRIES &&
            (status === 429 || status === 503 || error.code === "ECONNRESET");
        if (!shouldRetry)
            return Promise.reject(error);
        const retryAfter = status === 429
            ? Number(error.response?.headers["retry-after"] ?? 0) * 1000
            : BASE_DELAY_MS * 2 ** (config._retryCount - 1);
        await delay(retryAfter);
        return instance(config);
    });
    return instance;
}
function getClientFromEnv() {
    const org = process.env.AZURE_DEVOPS_ORG;
    const pat = process.env.AZURE_DEVOPS_PAT;
    if (!org || !pat) {
        throw new Error("AZURE_DEVOPS_ORG ve AZURE_DEVOPS_PAT ortam değişkenleri zorunludur.");
    }
    return createAzureDevOpsClient(org, pat);
}
//# sourceMappingURL=client.js.map