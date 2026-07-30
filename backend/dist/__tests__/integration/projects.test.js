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
const projectsApi = __importStar(require("../../azureDevOps/projectsApi"));
const client = __importStar(require("../../azureDevOps/client"));
const cache_1 = require("../../services/cache");
jest.mock("../../azureDevOps/client");
jest.mock("../../azureDevOps/projectsApi");
const mockProject = {
    id: "proj-1",
    name: "MyApp",
    url: "https://dev.azure.com/klogs/MyApp",
    state: "wellFormed",
    lastUpdateTime: "2024-01-01T00:00:00Z",
};
beforeEach(() => {
    jest.resetAllMocks();
    (0, cache_1.cacheClear)();
    client.getClientFromEnv.mockReturnValue({});
    projectsApi.listProjects.mockResolvedValue([mockProject]);
});
describe("GET /api/projects", () => {
    it("proje listesini döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/projects");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe("MyApp");
    });
    it("Azure API hatası durumunda hata yanıtı döndürür", async () => {
        const axiosError = Object.assign(new Error("Upstream error"), {
            isAxiosError: true,
            response: { status: 401, data: { message: "Unauthorized" }, headers: {} },
        });
        projectsApi.listProjects.mockRejectedValue(axiosError);
        const res = await (0, supertest_1.default)(index_1.default).get("/api/projects");
        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Azure DevOps API hatası");
    });
});
//# sourceMappingURL=projects.test.js.map