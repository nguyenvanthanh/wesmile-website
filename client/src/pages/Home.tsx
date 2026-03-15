import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * WeSmile Homepage - Modern Professional Healthcare Design
 * 
 * Design Philosophy:
 * - Clean, trustworthy aesthetic with medical authority
 * - Generous whitespace emphasizing clarity and professionalism
 * - Subtle blue gradients reflecting dental/healthcare industry standards
 * - Typography hierarchy that guides users through information naturally
 * 
 * Color Palette:
 * - Primary: Deep teal-blue (#0891B2) - conveys trust and professionalism
 * - Accent: Bright cyan (#06B6D4) - energetic, modern, approachable
 * - Background: Pure white with soft gray accents - clinical cleanliness
 */

export default function Home() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch products and news from API
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: newsList = [], isLoading: newsLoading } = trpc.news.list.useQuery();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Get emoji based on product name
  const getProductEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('brush') || lowerName.includes('electric')) return '⚡';
    if (lowerName.includes('whiten') || lowerName.includes('strip')) return '✨';
    if (lowerName.includes('floss') || lowerName.includes('water')) return '💧';
    if (lowerName.includes('kit') || lowerName.includes('pro')) return '🪥';
    return '😊';
  };

  // Get gradient colors based on index
  const getGradientClass = (index: number) => {
    const gradients = [
      'from-blue-100 to-cyan-100',
      'from-teal-100 to-blue-100',
      'from-cyan-100 to-blue-100',
      'from-blue-100 to-teal-100',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{height: '80px'}}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo-wesmile.png" 
              alt="WeSmile" 
              className="h-64 w-auto"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Home
            </a>
            <a href="#products" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Product
            </a>
            <a href="#news" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              News
            </a>
            <a href="#contact" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
              Contact
            </a>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{user.name}</span>
                {user.role === 'admin' && (
                  <a href="/admin" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                    Admin
                  </a>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3">
            <a href="#home" className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2">
              Home
            </a>
            <a href="#products" className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2">
              Product
            </a>
            <a href="#news" className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2">
              News
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-cyan-600 transition-colors font-medium py-2">
              Contact
            </a>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <a href="/admin" className="block text-cyan-600 hover:text-cyan-700 font-semibold py-2">
                    Admin
                  </a>
                )}
                <Button 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-2"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Login
              </Button>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section with Background Image */}
      <section 
        id="home" 
        className="relative py-32 md:py-48 bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663372757773/JV7EzRGXJwgSUcWrLBcMYd/hero-woman-full-face-TXi7WyN7Z5VTszJL8STtyj.webp)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'right center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay Gradient - Left side only */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              The Science<br />Behind the Smile
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
              Advanced American Dental Care trusted by dentists and patients worldwide.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg font-semibold">
                Shop Now
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our Vision & Mission
              </h2>
              <div className="w-16 h-1 bg-cyan-600 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vision Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xl">
                    👁️
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To provide professional dental care solutions that are trusted by dentists and loved by patients worldwide. We believe in making premium oral care accessible to everyone.
                </p>
              </div>

              {/* Mission Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-xl border border-teal-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white text-xl">
                    🎯
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To deliver innovative, science-backed dental products that empower individuals to achieve their best smile. Our commitment is to excellence, quality, and customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Premium Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade dental care products designed for optimal results
            </p>
            <div className="w-16 h-1 bg-cyan-600 mx-auto mt-4"></div>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-600" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer block text-left"
                >
                  <div className={`bg-gradient-to-br ${getGradientClass(index)} h-48 flex items-center justify-center`}>
                    <div className="text-5xl">{getProductEmoji(product.name)}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.description || 'Premium dental care product'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-cyan-600">${(product.price / 100).toFixed(2)}</span>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        Buy
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-gray-600">Endorsed by leading dental professionals and health organizations</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {/* Trust Badge 1 */}
            <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-4xl">🏥</div>
              <p className="font-semibold text-gray-900">FDA Approved</p>
              <p className="text-sm text-gray-600 text-center">Certified by FDA</p>
            </div>

            {/* Trust Badge 2 */}
            <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-4xl">👨‍⚕️</div>
              <p className="font-semibold text-gray-900">Dentist Approved</p>
              <p className="text-sm text-gray-600 text-center">Recommended by 95% of dentists</p>
            </div>

            {/* Trust Badge 3 */}
            <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-4xl">⭐</div>
              <p className="font-semibold text-gray-900">5-Star Rated</p>
              <p className="text-sm text-gray-600 text-center">Trusted by 100K+ users</p>
            </div>

            {/* Trust Badge 4 */}
            <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-4xl">🔬</div>
              <p className="font-semibold text-gray-900">Clinically Tested</p>
              <p className="text-sm text-gray-600 text-center">Science-backed results</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest News
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest in dental care and oral health
            </p>
            <div className="w-16 h-1 bg-cyan-600 mx-auto mt-4"></div>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-600" size={32} />
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No news available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newsList.slice(0, 3).map((newsItem: any) => (
                <div key={newsItem.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 h-48 flex items-center justify-center">
                    {newsItem.image ? (
                      <img src={newsItem.image} alt={newsItem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-5xl">📰</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{newsItem.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{newsItem.content || 'Latest news from WeSmile'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(newsItem.publishedAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline" className="text-cyan-600 border-cyan-600 hover:bg-cyan-50">
                        Read More <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Get exclusive tips, product launches, and special offers delivered to your inbox
            </p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-cyan-600 hover:bg-gray-100 px-8 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you
            </p>
            <div className="w-16 h-1 bg-cyan-600 mx-auto mt-4"></div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info 1 */}
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">support@wesmile.com</p>
            </div>

            {/* Contact Info 2 */}
            <div className="text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+1 (800) 123-4567</p>
            </div>

            {/* Contact Info 3 */}
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">New York, USA</p>
            </div>
          </div>
        </div>
      </section>

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
                <li><a href="#" className="hover:text-white transition-colors">Whitening Kits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Electric Brushes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Flossing Tools</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
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
