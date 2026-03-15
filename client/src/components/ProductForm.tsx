import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ProductFormProps {
  product?: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    images: string | null;
    category: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product ? (product.price / 100).toFixed(2) : "",
    image: product?.image || "",
    category: product?.category || "",
  });

  const [images, setImages] = useState<string[]>(() => {
    if (product?.images) {
      try {
        return JSON.parse(product.images);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    if (images.length >= 9) {
      toast.error("Maximum 9 images allowed");
      return;
    }

    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    toast.success("Image added");
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        setIsLoading(false);
        return;
      }

      if (!formData.name.trim()) {
        toast.error("Product name is required");
        setIsLoading(false);
        return;
      }

      if (product) {
        // Update existing product
        await updateMutation.mutateAsync({
          id: product.id,
          name: formData.name,
          description: formData.description || undefined,
          price,
          image: formData.image || undefined,
          category: formData.category || undefined,
          images: images.length > 0 ? JSON.stringify(images) : undefined,
        });
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          price,
          image: formData.image || undefined,
          category: formData.category || undefined,
          images: images.length > 0 ? JSON.stringify(images) : undefined,
        });
        toast.success("Product created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., WeSmile Pro Kit"
              className="w-full"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category
            </label>
            <Input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Whitening, Flossing"
              className="w-full"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Price (USD) *
            </label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 149.99"
              step="0.01"
              min="0"
              className="w-full"
              required
            />
          </div>

          {/* Main Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Main Image URL
            </label>
            <Input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Gallery Images (Max 9)
            </label>
            <div className="space-y-3">
              {/* Add Image Input */}
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  disabled={images.length >= 9}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1"
                >
                  <Plus size={18} />
                  Add
                </Button>
              </div>

              {/* Images List */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{images.length}/9 images</p>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="12" fill="%23999" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description..."
              rows={5}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
