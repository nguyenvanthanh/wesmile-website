# WeSmile Project TODO

## Phase 1: Core Features
- [x] Import WeSmile homepage design
- [x] Setup backend with web-db-user feature
- [x] Create database schema for products and news
- [x] Create product detail page
- [x] Change "Add to Cart" button to "Buy" button
- [x] Add product links to homepage
- [x] Create admin dashboard with login
- [x] Create admin product management page
- [x] Create admin news management page
- [x] Create API endpoints for products
- [x] Create API endpoints for news
- [x] Add authentication to admin routes

## Phase 2: Admin CRUD Features
- [x] Create product (add form, API endpoint)
- [x] Update product (edit form, API endpoint)
- [x] Delete product (API endpoint)
- [x] Create news (add form, API endpoint)
- [x] Update news (edit form, API endpoint)
- [x] Delete news (API endpoint)
- [x] Display products in admin dashboard
- [x] Display news in admin dashboard
- [x] Add CRUD unit tests

## Phase 3: Bug Fixes
- [x] Fix products not displaying on homepage (fetch from API)
- [x] Update Home.tsx to use trpc.products.list query
- [x] Add loading states for products and news
- [x] Handle empty states when no products/news exist

## Phase 4: Product Images & Gallery
- [x] Add images column to products table
- [x] Update ProductForm to accept multiple images (up to 9)
- [x] Fix product image display on homepage
- [x] Create image carousel/slide component
- [x] Add image gallery to product detail page
- [x] Update ProductDetail.tsx to fetch from database
- [x] Update related products section to use database

## Phase 5: Product Image Upload
- [x] Update ProductForm to upload images instead of link input
- [x] Implement 1 main image (required) + 8 description images (optional)
- [x] Create image upload API endpoint with S3 storage
- [x] Update routers to handle image uploads
- [x] Update Home.tsx and ProductDetail.tsx to display S3 images

## Phase 6: Login Page & Navigation
- [x] Create Login page component
- [x] Add /login route to App.tsx
- [x] Remove Login button from navigation bar
- [x] Test /login route accessibility

## Phase 8: Member Management & Permissions
- [x] Update user schema with role and permissions
- [x] Create member management page in admin dashboard
- [x] Create API endpoints for managing members
- [x] Implement permission checking for CRUD operations
- [x] Add role-based access control (RBAC)
- [ ] Set super admin for thanhnv286@gmail.com (manual database update)
- [ ] Test permission system with unit tests

## Phase 7: Enhancement
- [ ] Add news images
- [ ] Implement shopping cart functionality
- [ ] Add product filtering/search
- [ ] Add user profile page
- [ ] Add order history page

## Phase 10: Bug Fixes - Update Product Images
- [x] Fix "Failed to update product" error when updating with Main Image + Description Images
- [x] Debug image upload logic in ProductForm
- [x] Test update with only Main Image
- [x] Test update with Main Image + Description Images
- [x] Test update without changing images

## Phase 9: Branding & Polish
- [ ] Update favicon to WeSmile logo
- [ ] Remove "made by manus" footer text
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Analytics integration
