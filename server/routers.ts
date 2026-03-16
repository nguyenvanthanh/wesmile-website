import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { storagePut, storageGet } from "./storage";
import * as fs from 'fs';
import * as path from 'path';
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
  deleteNews,
  getAllUsers,
  getUserById,
  updateUserMemberRole
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

// Helper to check if user is super admin
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.memberRole !== 'super_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
  }
  return next({ ctx });
});

// Helper to check if user can create/edit (editor or higher)
const editorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = ['editor', 'admin', 'super_admin'];
  if (!allowedRoles.includes(ctx.user?.memberRole || '')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Editor access required' });
  }
  return next({ ctx });
});

// Helper to check if user can delete (admin or higher)
const deleteAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const allowedRoles = ['admin', 'super_admin'];
  if (!allowedRoles.includes(ctx.user?.memberRole || '')) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required to delete' });
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
    
    // Editor+ endpoints
    create: editorProcedure
      .input(productInputSchema)
      .mutation(async ({ input }) => {
        try {
          // Ensure price is properly rounded to cents
          const priceInCents = Math.round(parseFloat(String(input.price)) * 100);
          console.log('Creating product with price:', { inputPrice: input.price, priceInCents });
          
          const result = await createProduct({
            name: input.name,
            description: input.description || null,
            price: priceInCents,
            image: input.image || null,
            images: input.images || null,
            category: input.category || null,
          });
          return result;
        } catch (error) {
          console.error("Error creating product:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }),

    update: editorProcedure
      .input(z.object({
        id: z.number(),
        ...productInputSchema.shape,
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          console.log("Updating product:", { id, data });
          
          // Ensure price is properly rounded to cents
          const priceInCents = Math.round(parseFloat(String(data.price)) * 100);
          console.log('Updating product price:', { inputPrice: data.price, priceInCents });
          
          // Build update object with only defined fields
          const updateData: Record<string, any> = {
            name: data.name,
            price: priceInCents,
          };
          
          // Only include optional fields if they are provided
          if (data.description !== undefined) {
            updateData.description = data.description || null;
          }
          if (data.image !== undefined) {
            updateData.image = data.image || null;
          }
          if (data.images !== undefined) {
            updateData.images = data.images || null;
          }
          if (data.category !== undefined) {
            updateData.category = data.category || null;
          }
          
          console.log("Update data:", updateData);
          
          const result = await updateProduct(id, updateData);
          console.log("Update result:", result);
          
          return { success: true, message: "Product updated successfully" };
        } catch (error) {
          console.error("Error updating product:", error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update product: ${errorMsg}`
          });
        }
      }),

    delete: deleteAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          // Get product to find associated images
          const product = await getProductById(input.id);
          if (product) {
            // Delete main image
            if (product.image && product.image.startsWith('/images/')) {
              const imagePath = path.join(process.cwd(), 'client/public', product.image);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
            // Delete description images
            if (product.images) {
              try {
                const images = JSON.parse(product.images);
                if (Array.isArray(images)) {
                  images.forEach((img: string) => {
                    if (img && img.startsWith('/images/')) {
                      const imagePath = path.join(process.cwd(), 'client/public', img);
                      if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                      }
                    }
                  });
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
          await deleteProduct(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting product:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete product'
          });
        }
      }),

    uploadImage: editorProcedure
      .input(z.object({
        fileData: z.string().optional(),
        imageData: z.string().optional(),
        fileName: z.string(),
        fileType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Support both fileData and imageData parameter names
          const base64Data = input.imageData || input.fileData;
          if (!base64Data) {
            throw new Error('No image data provided');
          }

          // Remove data:image/...;base64, prefix if present
          let cleanBase64 = base64Data;
          if (base64Data.includes(',')) {
            cleanBase64 = base64Data.split(',')[1];
          }
          
          // Decode base64 to buffer
          const buffer = Buffer.from(cleanBase64, 'base64');
          
          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const filename = `${timestamp}-${randomStr}-${input.fileName}`;
          
          // Save to client/public/images/
          const publicDir = path.join(process.cwd(), 'client', 'public', 'images');
          const filepath = path.join(publicDir, filename);
          
          // Ensure directory exists
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          
          // Write file
          fs.writeFileSync(filepath, buffer);
          
          console.log('Saved image to:', filepath);
          
          // Return relative URL
          const imageUrl = `/images/${filename}`;
          console.log('Image URL:', imageUrl);
          
          return imageUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }),
  }),

  news: router({
    // Public endpoints
    list: publicProcedure.query(() => getNews()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getNewsById(input.id)),
    
    // Editor+ endpoints
    create: editorProcedure
      .input(newsInputSchema)
      .mutation(async ({ input }) => {
        try {
          const result = await createNews({
            title: input.title,
            content: input.content || null,
            image: input.image || null,
          });
          return result;
        } catch (error) {
          console.error("Error creating news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create news'
          });
        }
      }),

    update: editorProcedure
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
          return { success: true };
        } catch (error) {
          console.error("Error updating news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update news'
          });
        }
      }),

    delete: deleteAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          // Get news to find associated image
          const news = await getNewsById(input.id);
          if (news && news.image && news.image.startsWith('/images/')) {
            const imagePath = path.join(process.cwd(), 'client/public', news.image);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          await deleteNews(input.id);
          return { success: true };
        } catch (error) {
          console.error("Error deleting news:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete news'
          });
        }
      }),

    uploadImage: editorProcedure
      .input(z.object({
        fileData: z.string(),
        fileName: z.string(),
        fileType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const fileKey = `news/${timestamp}-${randomStr}-${input.fileName}`;
          
          const { url } = await storagePut(fileKey, buffer, input.fileType);
          return url;
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload image'
          });
        }
      }),
  }),

  members: router({
    list: superAdminProcedure.query(() => getAllUsers()),
    getById: superAdminProcedure.input(z.object({ id: z.number() })).query(({ input }) => getUserById(input.id)),
    
    updateRole: superAdminProcedure
      .input(z.object({
        userId: z.number(),
        memberRole: z.enum(['restricted', 'editor', 'admin', 'super_admin']),
      }))
      .mutation(async ({ input }) => {
        try {
          await updateUserMemberRole(input.userId, input.memberRole);
          return { success: true };
        } catch (error) {
          console.error("Error updating member role:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update member role'
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
