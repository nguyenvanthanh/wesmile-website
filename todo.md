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
- [x] Set super admin for thanhnv286@gmail.com (manual database update)
- [x] Test permission system with unit tests
- [x] Enforce RBAC in AdminDashboard UI (hide/show tabs and buttons based on role)
- [x] Editor role can only manage news
- [x] Admin role can manage products and news (with delete)
- [x] Super Admin role can manage everything including members
- [x] Fix role update not refreshing on UI (refetch members list and auth.me query)
- [x] Add warning message when updating own role

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

## Phase 9: News Detail Page
- [x] Create NewsDetail.tsx page to display full news article
- [x] Add /news/:id route to App.tsx
- [x] Remove published date from news cards on homepage
- [x] Add clickable links to news cards (image, title, "Read More" button)
- [x] Add hover effects and smooth transitions
- [x] All 37 unit tests pass

## Phase 10: Contact Information Update
- [x] Update email to support@wesmilecare.com
- [x] Update phone to +1 (773) 237-8855
- [x] Update address to 7162 83RD DR E BRADENTON, FL 34201-2152, USA
- [x] Change "Whitening Kits" to "Whitening Products" in footer

## Phase 11: Fix Unit Tests to Use Mocks
- [x] Replace direct database calls with mocks in unit tests
- [x] Use vi.mock() to mock the db module
- [x] Mock database responses for all CRUD operations
- [x] Verify all 35 unit tests pass
- [x] Confirm database has no test data after running tests
- [x] Tests no longer pollute production database

## Phase 12: Switch All Image Storage to Local /public/images
- [x] Audit all code for S3/CDN image references
- [x] Modify server upload endpoint to save images to /public/images instead of S3
- [x] Ensure client code references images from /images/ path
- [x] Update database to use local paths for all product and news images
- [x] Download hero background image to local
- [x] Remove storagePut/storageGet imports from routers.ts
- [x] Test image upload, display, and deletion with local storage

## Phase 13: Fix External Image URLs Not Displaying
- [ ] Fix product detail images not showing when using external URLs (Cloudinary etc.)
- [ ] Ensure ImageCarousel and ProductDetail support both local and external image URLs

## Phase 14: Performance Optimization
- [x] Analyze website performance (bundle size, network requests, images)
- [x] Optimize JavaScript bundle (code splitting with React.lazy for ProductDetail, NewsDetail, AdminDashboard, Login)
- [x] Optimize images (loading=lazy, decoding=async for all product/news images)
- [x] Add Cloudinary URL transforms (w_400, f_auto, q_auto) for product thumbnails
- [x] Add preconnect for Cloudinary domain
- [x] Add loading spinner fallback for lazy-loaded routes
- [x] Test performance improvements

## Phase 15: SEO Optimization
- [x] Add meta tags (title, description, keywords) with target keywords: wesmile, wesmile kit, wesmile teeth whitening
- [x] Add Open Graph tags for social media sharing
- [x] Add Twitter Card tags
- [x] Add structured data (JSON-LD) for Organization, WebSite, and Product
- [x] Optimize heading hierarchy and content with target keywords
- [x] Add robots.txt
- [x] Add sitemap.xml
- [x] Add canonical URLs
- [x] Optimize hero section, products section, vision/mission, footer with keywords
