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

  const createMutation = trpc.products.create.useMutation({
    onError: (error) => {
      console.error('Create mutation error:', error);
    }
  });
  const updateMutation = trpc.products.update.useMutation({
    onError: (error) => {
      console.error('Update mutation error:', error);
    }
  });
  const uploadImageMutation = trpc.products.uploadImage.useMutation({
    onError: (error) => {
      console.error('Upload image mutation error:', error);
    }
  });

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
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = descriptionImages.length + descriptionImagePreviews.length + newFiles.length;

    if (totalImages > 8) {
      toast.error("Maximum 8 description images allowed");
      return;
    }

    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is too large (max 5MB)`);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const uploadImages = async (): Promise<{ mainImageUrl: string; descriptionImageUrls: string[] }> => {
    let mainImageUrl = mainImagePreview;
    
    // Upload main image if new file was selected
    if (mainImage) {
      try {
        const base64Data = await fileToBase64(mainImage);
        mainImageUrl = await uploadImageMutation.mutateAsync({
          fileData: base64Data,
          fileName: mainImage.name,
          fileType: mainImage.type,
        });
      } catch (error) {
        console.error('Error uploading main image:', error);
        throw new Error('Failed to upload main image');
      }
    }

    const descriptionImageUrls: string[] = [...descriptionImagePreviews];
    
    // Upload only new description images
    for (const file of descriptionImages) {
      try {
        const base64Data = await fileToBase64(file);
        const url = await uploadImageMutation.mutateAsync({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
        });
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
        try {
          const result = await updateMutation.mutateAsync({
            id: product.id,
            name: formData.name,
            description: formData.description || undefined,
            price,
            image: mainImageUrl,
            category: formData.category || undefined,
            images: descriptionImageUrls.length > 0 ? JSON.stringify(descriptionImageUrls) : undefined,
          });
          console.log('Update result:', result);
          toast.success("Product updated successfully");
        } catch (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error details:", errorMessage);
      toast.error(`Failed to save product: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Whitening Kit"
              required
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              rows={4}
            />
          </div>

          {/* Product Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) *
            </label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Whitening"
            />
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image (Featured) *
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 transition">
                  <div className="flex flex-col items-center">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              {mainImagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={mainImagePreview}
                    alt="Main preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description Images ({descriptionImages.length + descriptionImagePreviews.length}/8)
            </label>
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 transition mb-4">
              <div className="flex flex-col items-center">
                <Plus size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to add images</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleDescriptionImageChange}
                className="hidden"
              />
            </label>

            {/* Description Images Preview */}
            {descriptionImagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {descriptionImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Description ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDescriptionImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
