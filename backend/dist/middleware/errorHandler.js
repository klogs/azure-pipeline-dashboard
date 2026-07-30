"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const axios_1 = __importDefault(require("axios"));
function errorHandler(err, _req, res, _next) {
    if (axios_1.default.isAxiosError(err)) {
        const status = err.response?.status ?? 502;
        const message = err.response?.data?.message ?? err.message;
        res.status(status).json({ error: "Azure DevOps API hatası", detail: message });
        return;
    }
    if (err instanceof Error) {
        res.status(500).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: "Bilinmeyen sunucu hatası" });
}
//# sourceMappingURL=errorHandler.js.map