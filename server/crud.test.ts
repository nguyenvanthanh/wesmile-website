import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Product CRUD operations", () => {
  it("should allow admin to create a product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      description: "A test product",
      price: 99.99,
      category: "Test",
      image: "https://example.com/image.jpg",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("created");
  });

  it("should deny non-admin users from creating products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.products.create({
        name: "Test Product",
        price: 99.99,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to update a product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.update({
      id: 1,
      name: "Updated Product",
      price: 149.99,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("updated");
  });

  it("should allow admin to delete a product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.delete({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.message).toContain("deleted");
  });
});

describe("News CRUD operations", () => {
  it("should allow admin to create news", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.create({
      title: "Test News",
      content: "This is test news content",
      image: "https://example.com/news.jpg",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("created");
  });

  it("should deny non-admin users from creating news", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.news.create({
        title: "Test News",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to update news", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.update({
      id: 1,
      title: "Updated News",
      content: "Updated content",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("updated");
  });

  it("should allow admin to delete news", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.delete({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.message).toContain("deleted");
  });
});

describe("Public read operations", () => {
  it("should allow anyone to list products", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow anyone to list news", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow anyone to get product by id", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getById({ id: 999 });

    // Should return undefined for non-existent product
    expect(result).toBeUndefined();
  });

  it("should allow anyone to get news by id", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.news.getById({ id: 999 });

    // Should return undefined for non-existent news
    expect(result).toBeUndefined();
  });
});
