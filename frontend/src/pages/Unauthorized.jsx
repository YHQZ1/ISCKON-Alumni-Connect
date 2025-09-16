import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  LogIn,
  Shield,
  Lock,
  AlertTriangle,
} from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gray-200/30 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-gray-300/30 rounded-full blur-xl"
          style={{ animation: "float 6s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gray-200/30 rounded-full blur-xl"
          style={{ animation: "float 8s ease-in-out infinite reverse" }}
        ></div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center shadow-md mx-auto">
              <Lock className="h-12 w-12 text-gray-50" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-300">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
          You don't have permission to access this page. This area is restricted
          to authorized users only.
        </p>

        <div className="bg-gray-100 rounded-xl p-4 mb-8 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-gray-700 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 text-left">
              If you believe you should have access to this page, please contact
              your administrator or try signing in with a different account.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center space-x-2 bg-gray-100 border border-gray-300 text-gray-800 px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="group flex items-center justify-center space-x-2 bg-gray-100 border border-gray-300 text-gray-800 px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <LogIn className="h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-300" />
            <span>Landing Page</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Need assistance?</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
            >
              Contact Support
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
            >
              Request Access
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-300"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;
