import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
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
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // Main image state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [existingMainImage, setExistingMainImage] = useState<string>("");

  // Description images - SEPARATED CLEARLY
  const [existingDescriptionUrls, setExistingDescriptionUrls] = useState<string[]>([]);
  const [newDescriptionFiles, setNewDescriptionFiles] = useState<File[]>([]);
  const [newDescriptionPreviews, setNewDescriptionPreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product ? (product.price / 100).toFixed(2) : "",
        category: product.category || "",
      });
      setExistingMainImage(product.image || "");
      
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        setExistingDescriptionUrls(images);
      } catch {
        setExistingDescriptionUrls([]);
      }
      
      setMainImage(null);
      setMainImagePreview("");
      setNewDescriptionFiles([]);
      setNewDescriptionPreviews([]);
    } else {
      setFormData({ name: "", description: "", price: "", category: "" });
      setExistingMainImage("");
      setExistingDescriptionUrls([]);
      setMainImage(null);
      setMainImagePreview("");
      setNewDescriptionFiles([]);
      setNewDescriptionPreviews([]);
    }
  }, [product]);

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
    const totalImages = existingDescriptionUrls.length + newDescriptionFiles.length + newFiles.length;

    if (totalImages > 8) {
      toast.error("Maximum 8 description images allowed");
      return;
    }

    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} is too large (max 5MB)`);
        return;
      }

      setNewDescriptionFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewDescriptionPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Remove existing image
  const handleRemoveExistingImage = (index: number) => {
    setExistingDescriptionUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image
  const handleRemoveNewImage = (index: number) => {
    setNewDescriptionFiles(prev => prev.filter((_, i) => i !== index));
    setNewDescriptionPreviews(prev => prev.filter((_, i) => i !== index));
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

  const uploadImages = async (): Promise<string[]> => {
    // Start with existing URLs (don't modify them)
    const descriptionImageUrls: string[] = [...existingDescriptionUrls];
    
    // Upload only NEW description images
    for (const file of newDescriptionFiles) {
      try {
        const base64Data = await fileToBase64(file);
        const url = await uploadImageMutation.mutateAsync({
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type,
        });
        
        // Ensure we're adding a valid URL, not a dataURL
        if (typeof url === 'string' && url.startsWith('http')) {
          descriptionImageUrls.push(url);
        } else {
          throw new Error('Invalid image URL returned from server');
        }
      } catch (error) {
        console.error('Error uploading description image:', error);
        throw new Error('Failed to upload description image');
      }
    }

    // Validate final result
    if (descriptionImageUrls.length > 8) {
      throw new Error('Too many description images');
    }

    // Ensure no dataURLs
    const hasDataUrl = descriptionImageUrls.some(url => url.startsWith('data:'));
    if (hasDataUrl) {
      throw new Error('Invalid image data detected');
    }

    return descriptionImageUrls;
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

      if (!mainImage && !existingMainImage) {
        toast.error("Main image is required");
        setIsLoading(false);
        return;
      }

      // Upload main image if new
      let mainImageUrl = existingMainImage;
      if (mainImage) {
        try {
          const base64Data = await fileToBase64(mainImage);
          mainImageUrl = await uploadImageMutation.mutateAsync({
            fileData: base64Data,
            fileName: mainImage.name,
            fileType: mainImage.type,
          });

          if (!mainImageUrl || typeof mainImageUrl !== 'string' || !mainImageUrl.startsWith('http')) {
            throw new Error('Invalid main image URL returned from server');
          }
        } catch (error) {
          console.error('Error uploading main image:', error);
          throw new Error('Failed to upload main image');
        }
      }

      // Upload description images
      let descriptionImageUrls: string[] = [];
      if (existingDescriptionUrls.length > 0 || newDescriptionFiles.length > 0) {
        descriptionImageUrls = await uploadImages();
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save product: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDescriptionImages = existingDescriptionUrls.length + newDescriptionFiles.length;

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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-gray-500">Click to upload</div>
                  </div>
                </label>
              </div>
              {(mainImagePreview || existingMainImage) && (
                <div className="relative w-24 h-24">
                  <img
                    src={mainImagePreview || existingMainImage}
                    alt="Main preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description Images ({totalDescriptionImages}/8)
            </label>
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 transition mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleDescriptionImageChange}
                className="hidden"
              />
              <div className="text-center">
                <div className="text-gray-500">Click to add images</div>
              </div>
            </label>

            {/* Existing Images */}
            {existingDescriptionUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Existing Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingDescriptionUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Existing ${index}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newDescriptionPreviews.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">New Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {newDescriptionPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={preview}
                        alt={`New ${index}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
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
              disabled={isLoading || createMutation.isPending || updateMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isLoading || createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : product
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
