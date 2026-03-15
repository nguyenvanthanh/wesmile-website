import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { storagePut } from "./storage";
import { 
  getProducts, 
  getProductById, 
  getNews, 
  getNewsById,
  createProduct,
  updateProduct,
  deleteProduct,
  createNews,
  updateNews,
  deleteNews
} from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

const productInputSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  image: z.string().optional(),
  images: z.string().optional(), // JSON string array
  category: z.string().optional(),
});

const newsInputSchema = z.object({
  title: z.string().min(1, "News title is required"),
  content: z.string().optional(),
  image: z.string().optional(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    // Public endpoints
    list: publicProcedure.query(() => getProducts()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getProductById(input.id)),
    
    // Admin endpoints
    create: adminProcedure
      .input(productInputSchema)
      .mutation(async ({ input }) => {
        try {
          const result = await createProduct({
            name: input.name,
            description: input.description || null,
            price: Math.round(input.price * 100), // Convert to cents
            image: input.image || null,
            images: input.images || null,
            category: input.category || null,
          });
          return { success: true, message: "Product created successfully" };
        } catch (error) {
          console.error("Error creating product:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create product'
          });
        }
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        ...productInputSchema.shape,
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          console.log("Updating product:", { id, data });
          
          await updateProduct(id, {
            name: data.name,
            description: data.description || null,
            price: Math.round(data.price * 100),
            image: data.image || null,
            images: data.images || null,
            category: data.category || null,
          });
          
          return { success: true, message: "Product updated successfully" };
        } catch (error) {
          console.error("Error updating product:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update product'
          });
        }
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteProduct(input.id);
          return { success: true, message: "Product deleted successfully" };
        } catch (error) {
          console.error("Error deleting product:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete product'
          });
        }
      }),

    uploadImage: adminProcedure
      .input(z.object({
        file: z.instanceof(File),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = await input.file.arrayBuffer();
          const fileName = `products/${Date.now()}-${input.file.name}`;
          const { url } = await storagePut(
            fileName,
            Buffer.from(buffer),
            input.file.type
          );
          return url;
        } catch (error) {
          console.error("Image upload error:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload image'
          });
        }
      }),
  }),

  news: router({
    // Public endpoints
    list: publicProcedure.query(() => getNews()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getNewsById(input.id)),
    
    // Admin endpoints
    create: adminProcedure
      .input(newsInputSchema)
      .mutation(async ({ input }) => {
        try {
          const result = await createNews({
            title: input.title,
            content: input.content || null,
            image: input.image || null,
          });
          return { success: true, message: "News created successfully" };
        } catch (error) {
          console.error("Error creating news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create news'
          });
        }
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        ...newsInputSchema.shape,
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          await updateNews(id, {
            title: data.title,
            content: data.content || null,
            image: data.image || null,
          });
          return { success: true, message: "News updated successfully" };
        } catch (error) {
          console.error("Error updating news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update news'
          });
        }
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteNews(input.id);
          return { success: true, message: "News deleted successfully" };
        } catch (error) {
          console.error("Error deleting news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete news'
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
