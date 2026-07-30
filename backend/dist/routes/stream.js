"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const sseService_1 = require("../services/sseService");
const router = (0, express_1.Router)();
// GET /api/stream — Server-Sent Events endpoint
router.get("/", (req, res) => {
    const clientId = (0, crypto_1.randomUUID)();
    (0, sseService_1.registerClient)(clientId, res);
    // Clean up on disconnect
    req.on("close", () => {
        (0, sseService_1.unregisterClient)(clientId);
    });
});
exports.default = router;
//# sourceMappingURL=stream.js.map