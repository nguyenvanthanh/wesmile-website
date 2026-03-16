import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  createNews: vi.fn(),
  updateNews: vi.fn(),
  deleteNews: vi.fn(),
  listProducts: vi.fn(),
  listNews: vi.fn(),
  getProductById: vi.fn(),
  getNewsById: vi.fn(),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      memberRole: "admin",
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

function createEditorContext(): TrpcContext {
  return {
    user: {
      id: 3,
      openId: "editor-user",
      email: "editor@example.com",
      name: "Editor User",
      loginMethod: "manus",
      role: "user",
      memberRole: "editor",
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
      memberRole: "restricted",
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin to create a product", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Mock the database response
    vi.mocked(db.createProduct).mockResolvedValueOnce({
      id: 1,
      name: "Test Product",
      description: "A test product",
      price: 99.99,
      category: "Test",
      image: "https://example.com/image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await caller.products.create({
      name: "Test Product",
      description: "A test product",
      price: 99.99,
      category: "Test",
      image: "https://example.com/image.jpg",
    });

    expect(result).toBeDefined();
    expect(vi.mocked(db.createProduct)).toHaveBeenCalled();
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

    // Mock the database response
    vi.mocked(db.updateProduct).mockResolvedValueOnce({
      id: 1,
      name: "Updated Product",
      description: "A test product",
      price: 149.99,
      category: "Test",
      image: "https://example.com/image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

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

    // Mock the database response
    vi.mocked(db.deleteProduct).mockResolvedValueOnce(true);

    const result = await caller.products.delete({ id: 1 });

    expect(result.success).toBe(true);
  });
});

describe("News CRUD operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin to create news", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Mock the database response
    vi.mocked(db.createNews).mockResolvedValueOnce({
      id: 1,
      title: "Test News",
      content: "This is test news content",
      image: "https://example.com/news.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await caller.news.create({
      title: "Test News",
      content: "This is test news content",
      image: "https://example.com/news.jpg",
    });

    expect(result).toBeDefined();
    expect(vi.mocked(db.createNews)).toHaveBeenCalled();
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

    // Mock the database response
    vi.mocked(db.updateNews).mockResolvedValueOnce({
      id: 1,
      title: "Updated News",
      content: "This is updated news content",
      image: "https://example.com/news.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await caller.news.update({
      id: 1,
      title: "Updated News",
    });

    expect(result.success).toBe(true);
  });

  it("should allow admin to delete news", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Mock the database response
    vi.mocked(db.deleteNews).mockResolvedValueOnce(true);

    const result = await caller.news.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it("should allow editor to create news", async () => {
    const ctx = createEditorContext();
    const caller = appRouter.createCaller(ctx);

    // Mock the database response
    vi.mocked(db.createNews).mockResolvedValueOnce({
      id: 2,
      title: "Editor News",
      content: "News from editor",
      image: "https://example.com/news.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await caller.news.create({
      title: "Editor News",
      content: "News from editor",
    });

    expect(result).toBeDefined();
    expect(vi.mocked(db.createNews)).toHaveBeenCalled();
  });

  it("should deny editor from deleting news", async () => {
    const ctx = createEditorContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.news.delete({ id: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
