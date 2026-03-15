import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NewsFormProps {
  newsItem?: {
    id: number;
    title: string;
    content: string | null;
    image: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewsForm({ newsItem, onClose, onSuccess }: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: newsItem?.title || "",
    content: newsItem?.content || "",
    image: newsItem?.image || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.news.create.useMutation();
  const updateMutation = trpc.news.update.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title.trim()) {
        toast.error("News title is required");
        setIsLoading(false);
        return;
      }

      if (newsItem) {
        // Update existing news
        await updateMutation.mutateAsync({
          id: newsItem.id,
          title: formData.title,
          content: formData.content || undefined,
          image: formData.image || undefined,
        });
        toast.success("News updated successfully");
      } else {
        // Create new news
        await createMutation.mutateAsync({
          title: formData.title,
          content: formData.content || undefined,
          image: formData.image || undefined,
        });
        toast.success("News created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error("Failed to save news");
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
            {newsItem ? "Edit News" : "Add New News"}
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
          {/* News Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              News Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., New Whitening Technology Launched"
              className="w-full"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Image URL
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

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Content
            </label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter news content..."
              rows={8}
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
              {isLoading ? "Saving..." : newsItem ? "Update News" : "Create News"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
