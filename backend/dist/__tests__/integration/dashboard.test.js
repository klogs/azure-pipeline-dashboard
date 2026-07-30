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
const dashboardService = __importStar(require("../../services/dashboardService"));
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
    dashboardService.getDashboard.mockResolvedValue(mockSummary);
});
describe("GET /api/dashboard", () => {
    it("dashboard özetini döndürür", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/dashboard");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].projectName).toBe("MyApp");
    });
    it("?refresh=true ile forceRefresh=true geçirir", async () => {
        await (0, supertest_1.default)(index_1.default).get("/api/dashboard?refresh=true");
        expect(dashboardService.getDashboard).toHaveBeenCalledWith(true);
    });
    it("?refresh olmadan forceRefresh=false geçirir", async () => {
        await (0, supertest_1.default)(index_1.default).get("/api/dashboard");
        expect(dashboardService.getDashboard).toHaveBeenCalledWith(false);
    });
});
//# sourceMappingURL=dashboard.test.js.map