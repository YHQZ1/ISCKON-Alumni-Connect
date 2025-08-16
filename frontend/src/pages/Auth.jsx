import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building,
  MapPin,
  Heart,
  Shield,
  ArrowRight,
  ChevronLeft,
  Globe,
  Users,
} from "lucide-react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState("alumni"); // alumni or institution
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    institutionName: "",
    graduationYear: "",
    location: "",
  });

  // Enhanced mouse tracking for parallax effects
  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Parallax calculation
  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${(mousePosition.x - window.innerWidth / 2) * strength * 0.01}px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle authentication logic here
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      institutionName: "",
      graduationYear: "",
      location: "",
    });
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      institutionName: "",
      graduationYear: "",
      location: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
      {/* Enhanced Floating Elements with Parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-200/30 to-amber-200/30 rounded-full blur-xl animate-pulse"
          style={parallaxOffset(0.3)}
        ></div>
        <div 
          className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.5),
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-r from-amber-200/30 to-yellow-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.4),
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-orange-300/20 to-yellow-300/20 rounded-full blur-lg"
          style={{
            ...parallaxOffset(0.6),
            animation: 'float 7s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                  <BookOpen className="h-7 w-7 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-2 w-2 text-white animate-spin" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  ISKCON Alumni
                </span>
                <div className="text-sm text-slate-500 font-medium">Connect & Contribute</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-slate-600 hover:text-orange-600 transition-all duration-300 font-medium">
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen pt-6">
        {/* Left Side - Welcome Content */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 py-24 relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 border border-orange-200/50 shadow-lg shadow-orange-500/10 mb-6 hover:scale-105 transition-transform duration-300">
                <Shield className="h-5 w-5 text-orange-600 animate-pulse" />
                <span className="text-sm font-semibold text-orange-700">Trusted & Secure Platform</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                Welcome to Your
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Spiritual Network
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Join thousands of ISKCON alumni reconnecting with their roots and 
                supporting the institutions that shaped their Krishna consciousness journey.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Users, number: "5000+", label: "Alumni Connected" },
                { icon: Building, number: "50+", label: "Institutions" },
                { icon: Heart, number: "₹25L+", label: "Contributions" },
                { icon: Globe, number: "30+", label: "Countries" },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.number}</div>
                  <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Radha Devi Dasi</div>
                  <div className="text-sm text-slate-600">Bhaktivedanta Manor '95</div>
                </div>
              </div>
              <p className="text-slate-700 italic">
                "Reconnecting with my gurukula and contributing to their library project 
                brought back so many beautiful memories. Hare Krishna!"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* User Type Selection */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-slate-200/50 p-8 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">I am a/an:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserType("alumni")}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      userType === "alumni"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white hover:border-orange-300 text-slate-600"
                    }`}
                  >
                    <GraduationCap className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Alumni</span>
                  </button>
                  <button
                    onClick={() => setUserType("institution")}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      userType === "institution"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white hover:border-orange-300 text-slate-600"
                    }`}
                  >
                    <Building className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Institution</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 border border-slate-200/50 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {isSignUp ? "Join Our Community" : "Welcome Back"}
                </h2>
                <p className="text-slate-600">
                  {isSignUp 
                    ? `Create your ${userType} account to get started`
                    : "Sign in to your account"
                  }
                </p>
              </div>

              <div className="space-y-6">
                {/* Full Name (Sign Up only) */}
                {isSignUp && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                      required
                    />
                  </div>
                )}

                {/* Institution Name (Sign Up + Institution only) */}
                {isSignUp && userType === "institution" && (
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="institutionName"
                      placeholder="Institution Name"
                      value={formData.institutionName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                    required
                  />
                </div>

                {/* Graduation Year (Sign Up + Alumni only) */}
                {isSignUp && userType === "alumni" && (
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="graduationYear"
                      placeholder="Graduation Year"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                    />
                  </div>
                )}

                {/* Location (Sign Up only) */}
                {isSignUp && (
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                    />
                  </div>
                )}

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password (Sign Up only) */}
                {isSignUp && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-orange-500 transition-colors duration-300" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors duration-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-4 rounded-2xl font-semibold hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transform flex items-center justify-center space-x-3"
                >
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                {/* Forgot Password (Sign In only) */}
                {!isSignUp && (
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-300"
                    >
                      Forgot your password?
                    </a>
                  </div>
                )}

                {/* Toggle Sign Up/Sign In */}
                <div className="text-center border-t border-slate-200 pt-6">
                  <p className="text-slate-600 mb-4">
                    {isSignUp 
                      ? "Already have an account?" 
                      : "Don't have an account?"
                    }
                  </p>
                  <button
                    type="button"
                    onClick={isSignUp ? switchToSignIn : switchToSignUp}
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-300 hover:underline"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center mt-8">
              <div className="flex items-center justify-center space-x-6 text-slate-500">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Trusted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;