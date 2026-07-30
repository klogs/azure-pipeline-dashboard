"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheInvalidate = cacheInvalidate;
exports.cacheClear = cacheClear;
const store = new Map();
function cacheGet(key) {
    const entry = store.get(key);
    if (!entry || Date.now() >= entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}
function cacheSet(key, data, ttlSeconds) {
    store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}
function cacheInvalidate(key) {
    store.delete(key);
}
function cacheClear() {
    store.clear();
}
//# sourceMappingURL=cache.js.map