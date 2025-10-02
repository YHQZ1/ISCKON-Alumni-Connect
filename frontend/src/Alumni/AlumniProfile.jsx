import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  User,
  MapPin,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Phone,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AlumniProfile = () => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    graduation_year: "",
    location: "",
    created_at: "",
    phone: "",
    bio: "",
    website: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileData(response.data.user);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile data");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!profileData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!profileData.graduation_year)
      newErrors.graduation_year = "Graduation year is required";
    if (!profileData.location.trim())
      newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      newErrors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");
      const response = await axios.put(
        `${BASE_URL}/api/users/me`,
        {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          graduation_year: profileData.graduation_year,
          location: profileData.location,
          phone: profileData.phone,
          bio: profileData.bio,
          website: profileData.website,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfileData(response.data.user);
      setIsEditing(false);
      setMessage("Profile updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        `${BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setMessage("Password changed successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    fetchProfile();
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  if (isLoading && !profileData.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/alumni/home")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-medium group cursor-pointer mb-6"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Home</span>
          </button>

          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {profileData.first_name} {profileData.last_name}
            </h1>
            <p className="text-gray-600 text-lg">
              {profileData.graduation_year ? `Class of ${profileData.graduation_year}` : "Alumni"}
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-8 p-4 rounded-lg text-center max-w-2xl mx-auto ${
              message.includes("success")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation - Desktop */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-300 ${
                    activeSection === "profile"
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile Information</span>
                </button>
                <button
                  onClick={() => setActiveSection("security")}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-300 ${
                    activeSection === "security"
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Security & Password</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                    <p className="text-gray-600">Update your personal details and information</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium cursor-pointer"
                    >
                      <Edit3 className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="text"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                            errors.first_name ? "border-rose-500/50" : "border-gray-300"
                          } ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="text-rose-500 text-sm mt-2">
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="text"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                            errors.last_name ? "border-rose-500/50" : "border-gray-300"
                          } ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      {errors.last_name && (
                        <p className="text-rose-500 text-sm mt-2">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Graduation Year and Location */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Graduation Year
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <select
                          name="graduation_year"
                          value={profileData.graduation_year}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                            errors.graduation_year
                              ? "border-rose-500/50"
                              : "border-gray-300"
                          } ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          <option value="">Select year</option>
                          {Array.from(
                            { length: 50 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.graduation_year && (
                        <p className="text-rose-500 text-sm mt-2">
                          {errors.graduation_year}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                            errors.location ? "border-rose-500/50" : "border-gray-300"
                          } ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                          placeholder="City, Country"
                        />
                      </div>
                      {errors.location && (
                        <p className="text-rose-500 text-sm mt-2">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type="url"
                          name="website"
                          value={profileData.website || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                      className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Member Since
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <input
                        type="text"
                        value={formatDate(profileData.created_at)}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security & Password</h2>
                    <p className="text-gray-600">Manage your password and security settings</p>
                  </div>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="mt-4 sm:mt-0 flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors duration-300 font-medium cursor-pointer"
                    >
                      <Lock className="h-5 w-5" />
                      <span>Change Password</span>
                    </button>
                  ) : (
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-5 w-5" />
                        <span>{isLoading ? "Updating..." : "Update Password"}</span>
                      </button>
                      <button
                        onClick={handleCancelPasswordChange}
                        className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isChangingPassword ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Security</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Your password was last changed on {formatDate(profileData.created_at)}. 
                      For security reasons, we recommend changing your password regularly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                            errors.currentPassword
                              ? "border-rose-500/50"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              current: !showPassword.current,
                            })
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                        >
                          {showPassword.current ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-rose-500 text-sm mt-2">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <input
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                              errors.newPassword
                                ? "border-rose-500/50"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                new: !showPassword.new,
                              })
                            }
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                          >
                            {showPassword.new ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-rose-500 text-sm mt-2">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                              errors.confirmPassword
                                ? "border-rose-500/50"
                                : "border-gray-300"
                            }`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                confirm: !showPassword.confirm,
                              })
                            }
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-rose-500 text-sm mt-2">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;