"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../services/cache");
describe("cache", () => {
    it("TTL içinde veriyi döndürür", () => {
        (0, cache_1.cacheSet)("key1", { foo: "bar" }, 60);
        expect((0, cache_1.cacheGet)("key1")).toEqual({ foo: "bar" });
    });
    it("TTL sona erince null döndürür", () => {
        (0, cache_1.cacheSet)("key2", "value", 0);
        // TTL=0 → hemen süresi dolmuş sayılır
        expect((0, cache_1.cacheGet)("key2")).toBeNull();
    });
    it("invalidate sonrası null döndürür", () => {
        (0, cache_1.cacheSet)("key3", "data", 60);
        (0, cache_1.cacheInvalidate)("key3");
        expect((0, cache_1.cacheGet)("key3")).toBeNull();
    });
    it("mevcut olmayan anahtar için null döndürür", () => {
        expect((0, cache_1.cacheGet)("nonexistent")).toBeNull();
    });
});
//# sourceMappingURL=cache.test.js.map