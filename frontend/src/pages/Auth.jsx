import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building,
  MapPin,
  Shield,
  Phone,
  Globe,
  FileText,
  Hash,
  X,
  Image,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Auth = () => {
  const [message, setMessage] = useState("");
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
    displayName: "",
    registrationNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    contactPersonName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    description: "",
    graduationYear: "",
    agreeToTerms: false,
    logo: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { userType: paramUserType } = useParams();
  const [userType, setUserType] = useState(paramUserType || "alumni");

  const [isSignUp, setIsSignUp] = useState(() => {
    return !!paramUserType;
  });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  useEffect(() => {
    if (paramUserType) {
      setUserType(paramUserType);
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [paramUserType]);

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
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

    // Basic fields for all signups
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password || formData.password.trim() === "") {
      newErrors.password = "Password is required";
    } else if (isSignUp && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      // Confirm password
      if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }

      // Common fields for both user types
      if (!formData.phone || formData.phone.trim() === "") {
        newErrors.phone = "Phone number is required";
      }

      if (userType === "alumni") {
        // Alumni specific fields - only the requested ones
        if (!formData.firstName || formData.firstName.trim() === "") {
          newErrors.firstName = "First name is required";
        }
        if (!formData.lastName || formData.lastName.trim() === "") {
          newErrors.lastName = "Last name is required";
        }
        if (!formData.graduationYear) {
          newErrors.graduationYear = "Graduation year is required";
        }
      }

      if (userType === "institution") {
        // Institution specific fields - ONLY make essential fields required like in working code
        if (
          !formData.institutionName ||
          formData.institutionName.trim() === ""
        ) {
          newErrors.institutionName = "Institution name is required";
        }
        if (!formData.city || formData.city.trim() === "") {
          newErrors.city = "City is required";
        }

        // REMOVED: Logo validation (no longer required)
        // REMOVED: All other institution field validations that were making them required

        // Only validate logo if provided (optional)
        if (formData.logo) {
          if (
            !["image/jpeg", "image/png", "image/jpg"].includes(
              formData.logo.type
            )
          ) {
            newErrors.logo = "Logo must be a JPEG or PNG image";
          }
          if (formData.logo.size > 5 * 1024 * 1024) {
            newErrors.logo = "Logo must be less than 5MB";
          }
        }

        // Contact email validation only if provided
        if (
          formData.contactEmail &&
          !/\S+@\S+\.\S+/.test(formData.contactEmail)
        ) {
          newErrors.contactEmail = "Please enter a valid contact email";
        }
      }

      // Terms agreement
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "Please agree to the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (userType === "alumni") {
        formDataToSend.append("firstName", formData.firstName);
        formDataToSend.append("lastName", formData.lastName);
        formDataToSend.append("graduationYear", formData.graduationYear);
      }
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("institutionName", formData.institutionName);
      formDataToSend.append("userType", userType);
      if (userType === "institution") {
        formDataToSend.append("displayName", formData.displayName);
        formDataToSend.append(
          "registrationNumber",
          formData.registrationNumber
        );
        formDataToSend.append("street", formData.street);
        formDataToSend.append("city", formData.city);
        formDataToSend.append("state", formData.state);
        formDataToSend.append("pincode", formData.pincode);
        formDataToSend.append("country", formData.country);
        formDataToSend.append("contactPersonName", formData.contactPersonName);
        formDataToSend.append("contactEmail", formData.contactEmail);
        formDataToSend.append("contactPhone", formData.contactPhone);
        formDataToSend.append("website", formData.website);
        formDataToSend.append("description", formData.description);
        if (formData.logo) {
          formDataToSend.append("logo", formData.logo);
        }
      }

      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        isSignUp
          ? formDataToSend
          : {
              email: formData.email,
              password: formData.password,
            },
        isSignUp ? { headers: { "Content-Type": "multipart/form-data" } } : {}
      );

      const { token, user } = response.data;

      localStorage.setItem("jwtToken", token);

      setIsLoading(false);

      if (user.user_type === "institution") {
        navigate("/institute/home");
      } else {
        navigate("/alumni/home");
      }
    } catch (error) {
      setIsLoading(false);

      if (error.response?.data?.error) {
        const serverMsg = error.response.data.error.toLowerCase();

        if (serverMsg.includes("invalid credentials")) {
          setMessage("No account found with this email or incorrect password.");
        } else if (serverMsg.includes("email already in use")) {
          setMessage("This email is already registered. Try signing in.");
        } else {
          setMessage(error.response.data.error);
        }
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  const toggleAuthMode = () => {
    if (!isSignUp) {
      setUserType("alumni");
    }
    setIsSignUp(!isSignUp);

    setFormData((prev) => ({
      firstName: "",
      lastName: "",
      email: prev.email,
      password: prev.password,
      confirmPassword: "",
      phone: "",
      institutionName: "",
      displayName: "",
      registrationNumber: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      contactPersonName: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      description: "",
      graduationYear: "",
      agreeToTerms: false,
      logo: null,
    }));
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden flex items-center justify-center relative">
      {/* Background elements - hidden on mobile */}
      <div className="hidden sm:block fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-gray-200/30 rounded-full blur-xl animate-pulse"
          style={parallaxOffset(0.3)}
        ></div>
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-gray-300/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.5),
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gray-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.4),
            animation: "float 8s ease-in-out infinite reverse",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gray-300/20 rounded-full blur-lg"
          style={{
            ...parallaxOffset(0.6),
            animation: "float 7s ease-in-out infinite",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-xl shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center space-x-2 sm:space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                  <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-gray-50 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  Alumni Connect
                </span>
                <div className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">
                  Support & Give Back
                </div>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors duration-300 font-medium group"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Left side - Hero section */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 shadow-sm mb-6 sm:mb-8 hover:scale-105 transition-transform duration-300">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                Secure & Trusted Platform
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="text-gray-800 block">
                {isSignUp ? "Join Our" : "Welcome"}
              </span>
              <span className="text-gray-700 block">
                {isSignUp ? "Community" : "Back"}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              {isSignUp
                ? "Connect with thousands of alumni and educational institutions worldwide. Support education with transparency and trust."
                : "Sign in to reconnect with your alma mater and support the institutions that shaped your educational journey."}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300 text-center sm:text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3 sm:mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-gray-50" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                  For Alumni
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Reconnect with your school and make meaningful contributions
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300 text-center sm:text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto sm:mx-0 mb-3 sm:mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-gray-50" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                  For Schools
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Connect with alumni and showcase your funding needs
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gray-300/20 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-10">
              {isSignUp && (
                <div className="mb-6 sm:mb-8">
                  <div className="text-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
                      I am an:
                    </h3>
                  </div>
                  <div className="flex rounded-2xl bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setUserType("alumni")}
                      className={`flex-1 cursor-pointer py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        userType === "alumni"
                          ? "bg-gray-800 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Alumni</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("institution")}
                      className={`flex-1 cursor-pointer py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        userType === "institution"
                          ? "bg-gray-800 text-white shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Institution</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? "Create Account" : "Sign In"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {isSignUp
                    ? `Join as ${
                        userType === "alumni" ? "an" : "an"
                      } ${userType}`
                    : "Welcome back to our community"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {isSignUp && userType === "alumni" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.firstName
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="First name"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.lastName
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="Last name"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.phone
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Graduation Year *
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <select
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.graduationYear
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
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
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.graduationYear}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {isSignUp && userType === "institution" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Institution Legal Name *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="text"
                          name="institutionName"
                          value={formData.institutionName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.institutionName
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="Institution name"
                        />
                      </div>
                      {errors.institutionName && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.institutionName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Display Name *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.displayName
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="Display name"
                          />
                        </div>
                        {errors.displayName && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.displayName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Registration Number *
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.registrationNumber
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="Registration number"
                          />
                        </div>
                        {errors.registrationNumber && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.phone
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.street
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="Street address"
                        />
                      </div>
                      {errors.street && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.city
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.state
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="State"
                        />
                        {errors.state && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.state}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.pincode
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                          placeholder="Pincode"
                        />
                        {errors.pincode && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.pincode}
                          </p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.country
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="India">India</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.country && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Person Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="text"
                            name="contactPersonName"
                            value={formData.contactPersonName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.contactPersonName
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="Contact person name"
                          />
                        </div>
                        {errors.contactPersonName && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.contactPersonName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Phone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                          <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                              errors.contactPhone
                                ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                                : "border-gray-300"
                            }`}
                            placeholder="Contact phone"
                          />
                        </div>
                        {errors.contactPhone && (
                          <p className="text-rose-500 text-xs sm:text-sm mt-1">
                            {errors.contactPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Institution Logo *
                      </label>
                      <div className="relative">
                        <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="file"
                          name="logo"
                          accept="image/jpeg,image/png"
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                            errors.logo
                              ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.logo && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.logo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-4 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base"
                          placeholder="Brief description"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                        errors.email
                          ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                          : "border-gray-300"
                      }`}
                      placeholder="Email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-rose-500 text-xs sm:text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                        errors.password
                          ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                          : "border-gray-300"
                      }`}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-xs sm:text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                          errors.confirmPassword
                            ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-rose-500 text-xs sm:text-sm mt-1">
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
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800 cursor-pointer focus:ring-gray-500/50 border-2 border-gray-300 bg-gray-50 rounded-md mt-1 flex-shrink-0"
                    />
                    <div className="text-xs sm:text-sm">
                      <span className="text-gray-600">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-gray-800 hover:text-gray-900 font-semibold underline transition-colors duration-300"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-gray-800 hover:text-gray-900 font-semibold underline transition-colors duration-300"
                        >
                          Privacy Policy
                        </button>
                      </span>
                      {errors.agreeToTerms && (
                        <p className="text-rose-500 text-xs sm:text-sm mt-1">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-amber-100 text-amber-700 p-3 rounded-md mb-4 text-center border border-amber-200 text-sm sm:text-base">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative bg-gray-800 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center space-x-2 sm:space-x-3 overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white relative z-10"></div>
                      <span className="relative z-10 text-sm sm:text-base">
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10 text-sm sm:text-base">
                        {isSignUp ? "Create Account" : "Sign In"}
                      </span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>

                {!isSignUp && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-gray-800 hover:text-gray-900 font-semibold transition-colors cursor-pointer duration-300 text-sm sm:text-base"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 sm:mt-8 text-center border-t border-gray-200 pt-4 sm:pt-6">
                <span className="text-gray-600 text-sm sm:text-base">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>
                <button
                  onClick={toggleAuthMode}
                  className="ml-2 text-gray-800 hover:text-gray-900 font-semibold transition-colors duration-300 hover:underline cursor-pointer text-sm sm:text-base"
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
            transform: translateY(-10px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
