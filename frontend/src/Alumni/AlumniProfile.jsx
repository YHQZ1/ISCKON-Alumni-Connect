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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AlumniProfile = () => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    graduation_year: "",
    location: "",
    created_at: "",
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get("http://localhost:4000/api/users/me", {
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
        "http://localhost:4000/api/users/me",
        {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          graduation_year: profileData.graduation_year,
          location: profileData.location,
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
        "http://localhost:4000/api/users/change-password",
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
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && !profileData.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Add this back button section right after the opening div */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate("/alumni/home")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-medium group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Alumni Profile
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
              >
                <Edit3 className="h-5 w-5" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-5 w-5" />
                  <span>{isLoading ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <p className="text-rose-500 text-sm mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <p className="text-rose-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <p className="text-rose-500 text-sm mt-1">
                  {errors.graduation_year}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <p className="text-rose-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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

        {/* Password Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Security</h2>
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
              >
                <Lock className="h-5 w-5" />
                <span>Change Password</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-5 w-5" />
                  <span>{isLoading ? "Updating..." : "Update Password"}</span>
                </button>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {isChangingPassword ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    placeholder="Enter current password"
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
                  <p className="text-rose-500 text-sm mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <p className="text-rose-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
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
                  <p className="text-rose-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 bg-gray-100 p-4 rounded-xl">
              <Shield className="h-6 w-6 text-gray-600" />
              <p className="text-gray-600">
                Last changed: {formatDate(profileData.created_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
