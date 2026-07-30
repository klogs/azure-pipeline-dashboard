"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// .env monorepo kökünde (backend/ → ../)
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "..", ".env") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const projects_1 = __importDefault(require("./routes/projects"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const pipelines_1 = __importDefault(require("./routes/pipelines"));
const stream_1 = __importDefault(require("./routes/stream"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/projects", projects_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.use("/api/pipelines", pipelines_1.default);
app.use("/api/stream", stream_1.default);
app.use(errorHandler_1.errorHandler);
// Sunucuyu yalnızca doğrudan çalıştırıldığında başlat (test ortamında çağrılmaz)
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map