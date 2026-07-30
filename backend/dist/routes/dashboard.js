"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardService_1 = require("../services/dashboardService");
const router = (0, express_1.Router)();
router.get("/", async (req, res, next) => {
    try {
        const forceRefresh = req.query.refresh === "true";
        const data = await (0, dashboardService_1.getDashboard)(forceRefresh);
        return res.json(data);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map