import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Upload } from "lucide-react";
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
    category: product?.category || "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>(product?.image || "");
  
  const [descriptionImages, setDescriptionImages] = useState<File[]>(() => {
    // If editing, we can't restore old images as files, so just start fresh
    return [];
  });
  
  const [descriptionImagePreviews, setDescriptionImagePreviews] = useState<string[]>(() => {
    if (product?.images) {
      try {
        return JSON.parse(product.images);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setMainImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMainImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDescriptionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (descriptionImages.length + files.length > 8) {
      toast.error("Maximum 8 description images allowed");
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return;
      }

      setDescriptionImages(prev => [...prev, file]);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setDescriptionImagePreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveDescriptionImage = (index: number) => {
    setDescriptionImages(prev => prev.filter((_, i) => i !== index));
    setDescriptionImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<{ mainImageUrl: string; descriptionImageUrls: string[] }> => {
    let mainImageUrl = mainImagePreview;
    
    // Upload main image if new file was selected
    if (mainImage) {
      try {
        mainImageUrl = await uploadImageMutation.mutateAsync({ file: mainImage });
      } catch (error) {
        console.error('Error uploading main image:', error);
        throw new Error('Failed to upload main image');
      }
    }

    const descriptionImageUrls: string[] = [...descriptionImagePreviews];
    
    // Upload only new description images
    for (const file of descriptionImages) {
      try {
        const url = await uploadImageMutation.mutateAsync({ file });
        descriptionImageUrls.push(url);
      } catch (error) {
        console.error('Error uploading description image:', error);
        throw new Error('Failed to upload description image');
      }
    }

    return { mainImageUrl, descriptionImageUrls };
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

      if (!mainImage && !mainImagePreview) {
        toast.error("Main image is required");
        setIsLoading(false);
        return;
      }

      // Upload images
      const { mainImageUrl, descriptionImageUrls } = await uploadImages();

      if (product) {
        // Update existing product
        await updateMutation.mutateAsync({
          id: product.id,
          name: formData.name,
          description: formData.description || undefined,
          price,
          image: mainImageUrl,
          category: formData.category || undefined,
          images: descriptionImageUrls.length > 0 ? JSON.stringify(descriptionImageUrls) : undefined,
        });
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          price,
          image: mainImageUrl,
          category: formData.category || undefined,
          images: descriptionImageUrls.length > 0 ? JSON.stringify(descriptionImageUrls) : undefined,
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

          {/* Main Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Main Image (Featured) *
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="hidden"
                  id="main-image-input"
                  required={!mainImagePreview}
                />
                <label htmlFor="main-image-input" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600 font-medium">Click to upload main image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>

              {mainImagePreview && (
                <div className="relative">
                  <img
                    src={mainImagePreview}
                    alt="Main product"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMainImage(null);
                      setMainImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description Images (Max 8, Optional)
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDescriptionImageChange}
                  className="hidden"
                  id="description-images-input"
                  multiple
                  disabled={descriptionImagePreviews.length >= 8}
                />
                <label 
                  htmlFor="description-images-input" 
                  className={`cursor-pointer ${descriptionImagePreviews.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600 font-medium">Click to upload description images</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                </label>
              </div>

              {descriptionImagePreviews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{descriptionImagePreviews.length}/8 images</p>
                  <div className="grid grid-cols-2 gap-3">
                    {descriptionImagePreviews.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Description ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionImage(index)}
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
