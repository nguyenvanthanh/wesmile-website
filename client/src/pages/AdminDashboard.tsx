import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("products");

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
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
                <Plus size={20} />
                Add Product
              </Button>
            </div>

            {/* Products Table */}
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
                  {/* Sample Product Row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">WeSmile Pro Kit</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Whitening</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">$149.00</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">Whitening Strips</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Whitening</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">$29.00</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">Water Flosser</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Flossing</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">$69.00</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Empty State Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Click "Add Product" to create new products. You can edit or delete existing products using the action buttons.
              </p>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">News</h2>
                <p className="text-gray-600 mt-1">Manage your news and updates</p>
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
                <Plus size={20} />
                Add News
              </Button>
            </div>

            {/* News Table */}
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
                  {/* Sample News Row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">New Whitening Technology Launched</td>
                    <td className="px-6 py-4 text-sm text-gray-600">March 14, 2026</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">WeSmile Wins Best Dental Product Award</td>
                    <td className="px-6 py-4 text-sm text-gray-600">March 10, 2026</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">Oral Health Tips from Expert Dentists</td>
                    <td className="px-6 py-4 text-sm text-gray-600">March 5, 2026</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Empty State Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Click "Add News" to publish new articles. You can edit or delete existing news using the action buttons.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
