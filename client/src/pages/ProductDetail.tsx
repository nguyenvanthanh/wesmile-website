import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import ImageCarousel from "@/components/ImageCarousel";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  
  const productId = params?.id ? parseInt(params.id) : null;
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const { data: allProducts = [] } = trpc.products.list.useQuery();

  if (!productId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => navigate("/")} className="bg-cyan-600 hover:bg-cyan-700">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => navigate("/")} className="bg-cyan-600 hover:bg-cyan-700">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const priceInDollars = (product.price / 100).toFixed(2);

  // Parse gallery images and add main image at the beginning
  let galleryImages: string[] = [];
  
  // Add main image first if it exists
  if (product.image) {
    galleryImages.push(product.image);
  }
  
  // Then add description images
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      // Ensure it's an array of strings
      if (Array.isArray(parsed)) {
        const descriptionImages = parsed.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
        galleryImages = [...galleryImages, ...descriptionImages];
      }
    } catch (error) {
      console.error('Failed to parse product images:', error);
    }
  }

  // Get related products (excluding current product)
  const relatedProducts = allProducts
    .filter((p: any) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Product Details</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Product Detail Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Product Images with Carousel */}
              <div>
                {galleryImages.length > 0 ? (
                  <ImageCarousel images={galleryImages} title={product.name} />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <div className="text-6xl">📦</div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <div className="mb-6">
                  {product.category && (
                    <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block mb-4">
                      {product.category}
                    </span>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  <div className="w-16 h-1 bg-cyan-600 mb-6"></div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="text-gray-600 text-sm font-semibold mb-2">PRICE</p>
                  <p className="text-5xl font-bold text-cyan-600">${priceInDollars}</p>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <p className="text-gray-600 text-sm font-semibold mb-3">DESCRIPTION</p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="mb-8">
                  <p className="text-gray-600 text-sm font-semibold mb-3">KEY FEATURES</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                      Professional-grade quality
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                      FDA approved and clinically tested
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                      Trusted by dentists worldwide
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                      Satisfaction guaranteed
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8">
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg font-semibold">
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 px-8 py-6 text-lg border-gray-300"
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-gray-600 text-sm font-semibold mb-4">TRUSTED BY</p>
                  <div className="flex gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏥</span>
                      <span className="text-sm text-gray-700">FDA Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👨‍⚕️</span>
                      <span className="text-sm text-gray-700">Dentist Recommended</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-sm text-gray-700">5-Star Rated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Related Products
              </h2>
              <div className="w-16 h-1 bg-cyan-600 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer block text-left"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 h-48 flex items-center justify-center overflow-hidden">
                    {relatedProduct.image ? (
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!relatedProduct.image && <div className="text-5xl">✨</div>}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{relatedProduct.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{relatedProduct.description || 'Premium dental care product'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-cyan-600">${(relatedProduct.price / 100).toFixed(2)}</span>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={(e) => e.stopPropagation()}>
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">WeSmile</h4>
              <p className="text-gray-400">Advanced American Dental Care</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Whitening Kits</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Electric Brushes</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Flossing Tools</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="/" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 WeSmile. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
