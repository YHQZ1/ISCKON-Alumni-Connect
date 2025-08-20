import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  MapPin,
  Heart,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [userType, setUserType] = useState(() => {
    const pathParts = window.location.pathname.split("/");
    if (pathParts.length > 3 && pathParts[2] === "signup") {
      return pathParts[3] === "institution" ? "institution" : "alumni";
    }
    return "alumni";
  });

  const [isSignUp, setIsSignUp] = useState(() => {
    return window.location.pathname.includes("/signup/");
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    institutionName: "",
    graduationYear: "",
    location: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (userType === "institution" && !formData.institutionName.trim()) {
        newErrors.institutionName = "Institution name is required";
      }
      if (userType === "alumni" && !formData.graduationYear) {
        newErrors.graduationYear = "Graduation year is required";
      }
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "Please agree to the terms and conditions";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    console.log("Form submitted:", { ...formData, userType });

    alert(
      isSignUp ? "Account created successfully!" : "Signed in successfully!"
    );
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      institutionName: "",
      graduationYear: "",
      location: "",
      agreeToTerms: false,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-xl animate-pulse"
          style={parallaxOffset(0.3)}
        ></div>
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.5),
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.4),
            animation: "float 8s ease-in-out infinite reverse",
          }}
        ></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                  <GraduationCap className="h-7 w-7 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-2 w-2 text-white animate-spin" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Alumni Connect
                </span>
                <div className="text-sm text-slate-500 font-medium">
                  Support & Give Back
                </div>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors duration-300 font-medium group"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-6xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="text-center lg:text-left animate-fade-in mt-30">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 border border-blue-200/50 shadow-lg shadow-blue-500/10 mb-8 hover:scale-105 transition-transform duration-300">
              <Shield className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-sm font-semibold text-blue-700">
                Secure & Trusted Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                {isSignUp ? "Join Our" : "Welcome"}
              </span>
              <span className="text-slate-800 block">
                {isSignUp ? "Community" : "Back"}
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {isSignUp
                ? "Connect with thousands of alumni and educational institutions worldwide. Support education with transparency and trust."
                : "Sign in to reconnect with your alma mater and support the institutions that shaped your educational journey."}
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">For Alumni</h3>
                <p className="text-sm text-slate-600">
                  Reconnect with your school and make meaningful contributions
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">For Schools</h3>
                <p className="text-sm text-slate-600">
                  Connect with alumni and showcase your funding needs
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-200/50 p-8 lg:p-10">
              {isSignUp && (
                <div className="mb-8">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                      I am an:
                    </h3>
                  </div>
                  <div className="flex rounded-2xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setUserType("alumni")}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        userType === "alumni"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                      <span>Alumni</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("institution")}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        userType === "institution"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <Building className="h-5 w-5" />
                      <span>Institution</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {isSignUp ? "Create Account" : "Sign In"}
                </h2>
                <p className="text-slate-600">
                  {isSignUp
                    ? `Join as ${
                        userType === "alumni" ? "an" : "an"
                      } ${userType}`
                    : "Welcome back to our community"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                            errors.firstName
                              ? "border-red-300"
                              : "border-slate-200"
                          }`}
                          placeholder="Enter your first name"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                            errors.lastName
                              ? "border-red-300"
                              : "border-slate-200"
                          }`}
                          placeholder="Enter your last name"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isSignUp && userType === "institution" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Institution Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input
                        type="text"
                        name="institutionName"
                        value={formData.institutionName}
                        onChange={handleInputChange}
                        className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                          errors.institutionName
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                        placeholder="Enter institution name"
                      />
                    </div>
                    {errors.institutionName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.institutionName}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                        errors.email ? "border-red-300" : "border-slate-200"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {isSignUp && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {userType === "alumni" && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Graduation Year
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                          <select
                            name="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleInputChange}
                            className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                              errors.graduationYear
                                ? "border-red-300"
                                : "border-slate-200"
                            }`}
                          >
                            <option value="">Select year</option>
                            {Array.from({ length: 50 }, (_, i) => 2024 - i).map(
                              (year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        {errors.graduationYear && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.graduationYear}
                          </p>
                        )}
                      </div>
                    )}
                    <div
                      className={
                        userType === "institution" ? "md:col-span-2" : ""
                      }
                    >
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                            errors.location
                              ? "border-red-300"
                              : "border-slate-200"
                          }`}
                          placeholder="City, Country"
                        />
                      </div>
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-4 pr-12 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                        errors.password ? "border-red-300" : "border-slate-200"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-4 pr-12 py-4 rounded-2xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white ${
                          errors.confirmPassword
                            ? "border-red-300"
                            : "border-slate-200"
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {isSignUp && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-2 border-slate-300 rounded-md"
                    />
                    <div className="text-sm">
                      <span className="text-slate-600">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-300"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-300"
                        >
                          Privacy Policy
                        </button>
                      </span>
                      {errors.agreeToTerms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={() => navigate("/alumni/home")}
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-8 text-center border-t border-slate-200 pt-6">
                <span className="text-slate-600">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>
                <button
                  onClick={toggleAuthMode}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
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
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
