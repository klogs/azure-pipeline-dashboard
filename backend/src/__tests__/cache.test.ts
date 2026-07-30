import { cacheGet, cacheSet, cacheInvalidate } from "../services/cache";

describe("cache", () => {
  it("TTL içinde veriyi döndürür", () => {
    cacheSet("key1", { foo: "bar" }, 60);
    expect(cacheGet("key1")).toEqual({ foo: "bar" });
  });

  it("TTL sona erince null döndürür", () => {
    cacheSet("key2", "value", 0);
    // TTL=0 → hemen süresi dolmuş sayılır
    expect(cacheGet("key2")).toBeNull();
  });

  it("invalidate sonrası null döndürür", () => {
    cacheSet("key3", "data", 60);
    cacheInvalidate("key3");
    expect(cacheGet("key3")).toBeNull();
  });

  it("mevcut olmayan anahtar için null döndürür", () => {
    expect(cacheGet("nonexistent")).toBeNull();
  });
});
