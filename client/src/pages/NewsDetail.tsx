import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NewsDetail() {
  const [location, navigate] = useLocation();
  
  // Extract news ID from URL path
  const newsId = parseInt(location.split('/').pop() || '0');
  
  // Fetch all news to find the one we need
  const { data: newsList = [], isLoading } = trpc.news.list.useQuery();
  
  const newsItem = newsList.find(n => n.id === newsId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-600" size={32} />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">News Not Found</h1>
          <p className="text-gray-600 mb-6">The news article you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{height: '80px'}}>
          <div className="flex items-center gap-2">
            <img 
              src="/logo-wesmile.png" 
              alt="WeSmile" 
              className="h-64 w-auto"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* News Detail Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Featured Image */}
          {newsItem.image && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={newsItem.image} 
                alt={newsItem.title} 
                loading="lazy"
                decoding="async"
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {newsItem.title}
          </h1>

          {/* Divider */}
          <div className="w-16 h-1 bg-cyan-600 mb-8"></div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700 mb-12">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">
              {newsItem.content || 'No content available'}
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2 text-cyan-600 border-cyan-600 hover:bg-cyan-50"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
