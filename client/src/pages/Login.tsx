import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-600 mb-2">WeSmile</h1>
            <p className="text-gray-600">Advanced American Dental Care</p>
          </div>

          {/* Login Content */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng Nhập</h2>
              <p className="text-gray-600 text-sm">
                Vui lòng đăng nhập để tiếp tục
              </p>
            </div>

            {/* Login Button */}
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors"
              size="lg"
            >
              Đăng Nhập Với Manus
            </Button>

            {/* Additional Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Bạn sẽ được chuyển hướng đến trang đăng nhập Manus
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Cần hỗ trợ?{" "}
            <a href="#contact" className="text-cyan-600 hover:text-cyan-700 font-semibold">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
