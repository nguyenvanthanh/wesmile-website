import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ProductForm from "@/components/ProductForm";
import NewsForm from "@/components/NewsForm";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  // Queries
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: newsList = [], isLoading: newsLoading, refetch: refetchNews } = trpc.news.list.useQuery();

  // Mutations
  const deleteProductMutation = trpc.products.delete.useMutation();
  const deleteNewsMutation = trpc.news.delete.useMutation();

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          {!user ? (
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Login as Admin
            </Button>
          ) : (
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProductMutation.mutateAsync({ id });
      toast.success("Product deleted successfully");
      refetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news?")) return;
    
    try {
      await deleteNewsMutation.mutateAsync({ id });
      toast.success("News deleted successfully");
      refetchNews();
    } catch (error) {
      toast.error("Failed to delete news");
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleEditNews = (newsItem: any) => {
    setSelectedNews(newsItem);
    setShowNewsForm(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleAddNews = () => {
    setSelectedNews(null);
    setShowNewsForm(true);
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setSelectedProduct(null);
  };

  const handleNewsFormClose = () => {
    setShowNewsForm(false);
    setSelectedNews(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WeSmile Admin</h1>
            <p className="text-sm text-gray-600">Manage products and news</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user.name}</span>
            <Button 
              variant="outline"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Products</h2>
                <p className="text-gray-600 mt-1">Manage your product catalog</p>
              </div>
              <Button 
                className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
                onClick={handleAddProduct}
              >
                <Plus size={20} />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cyan-600" size={32} />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No products yet. Create your first product!</p>
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleAddProduct}
                >
                  Create First Product
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">${(product.price / 100).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit2 size={16} />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">News</h2>
                <p className="text-gray-600 mt-1">Manage your news and updates</p>
              </div>
              <Button 
                className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
                onClick={handleAddNews}
              >
                <Plus size={20} />
                Add News
              </Button>
            </div>

            {/* News Table */}
            {newsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cyan-600" size={32} />
              </div>
            ) : newsList.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No news yet. Create your first news article!</p>
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  onClick={handleAddNews}
                >
                  Create First News
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Published Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {newsList.map((newsItem: any) => (
                      <tr key={newsItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{newsItem.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(newsItem.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleEditNews(newsItem)}
                          >
                            <Edit2 size={16} />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            onClick={() => handleDeleteNews(newsItem.id)}
                            disabled={deleteNewsMutation.isPending}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          onClose={handleProductFormClose}
          onSuccess={refetchProducts}
        />
      )}

      {/* News Form Modal */}
      {showNewsForm && (
        <NewsForm
          newsItem={selectedNews}
          onClose={handleNewsFormClose}
          onSuccess={refetchNews}
        />
      )}
    </div>
  );
}
