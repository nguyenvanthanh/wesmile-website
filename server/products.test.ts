import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should return an empty list of products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle getById with a valid product id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // This should return undefined since we don't have sample data
    const result = await caller.products.getById({ id: 999 });

    expect(result).toBeUndefined();
  });
});

describe("news router", () => {
  it("should return an empty list of news", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle getById with a valid news id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // This should return undefined since we don't have sample data
    const result = await caller.news.getById({ id: 999 });

    expect(result).toBeUndefined();
  });
});
