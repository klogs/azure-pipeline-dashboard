"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "test";
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
describe("GET /api/health", () => {
    it("200 döndürür ve status:ok içerir", async () => {
        const res = await (0, supertest_1.default)(index_1.default).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
        expect(typeof res.body.timestamp).toBe("string");
    });
});
//# sourceMappingURL=health.test.js.map