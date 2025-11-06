/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Home,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Building,
  Hash,
  Image as ImageIcon,
  FileText,
  Image,
  Shield,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const InstituteProfile = () => {
  const [schoolData, setSchoolData] = useState({
    name: "",
    display_name: "",
    registration_number: "",
    description: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    contact_person_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    logo_url: "",
    created_at: "",
  });
  const [formData, setFormData] = useState({ logo: null });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchSchool();
    } else {
      fetchUserSchool();
    }
  }, [id]);

  const fetchUserSchool = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");

      const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = userResponse.data.user.id;

      const schoolsResponse = await axios.get(`${BASE_URL}/api/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userSchool = schoolsResponse.data.schools.find(
        (school) => school.owner_id === userId
      );

      if (userSchool) {
        navigate(`/institute/profile/${userSchool.id}`, { replace: true });
      } else {
        setMessage(
          "No school found for your account. Please create a school first."
        );
      }
    } catch {
      setMessage("Failed to load school profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchool = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(`${BASE_URL}/api/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.school) {
        setSchoolData(response.data.school);
        setMessage("");
      } else {
        throw new Error("Invalid response format - no school data");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage(
          "School not found. It may have been deleted or you don't have access."
        );
      } else if (error.response?.status === 401) {
        setMessage("Please log in to view this page");
        navigate("/login");
      } else {
        setMessage("Failed to load school profile. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchoolData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
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

    if (!schoolData.name.trim()) newErrors.name = "School name is required";

    if (
      schoolData.contact_email &&
      !/\S+@\S+\.\S+/.test(schoolData.contact_email)
    ) {
      newErrors.contact_email = "Email is invalid";
    }

    if (
      schoolData.contact_phone &&
      !/^\d{10}$/.test(schoolData.contact_phone.replace(/\D/g, ""))
    ) {
      newErrors.contact_phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("jwtToken");

      const formDataToSend = new FormData();

      formDataToSend.append("display_name", schoolData.display_name || "");
      formDataToSend.append("street", schoolData.street || "");
      formDataToSend.append("city", schoolData.city || "");
      formDataToSend.append("state", schoolData.state || "");
      formDataToSend.append("pincode", schoolData.pincode || "");
      formDataToSend.append(
        "contact_person_name",
        schoolData.contact_person_name || ""
      );
      formDataToSend.append("contact_email", schoolData.contact_email || "");
      formDataToSend.append("contact_phone", schoolData.contact_phone || "");
      formDataToSend.append("website", schoolData.website || "");
      formDataToSend.append("description", schoolData.description || "");

      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      const response = await axios.put(
        `${BASE_URL}/api/schools/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.school) {
        setSchoolData(response.data.school);
        setFormData({ logo: null });
        setIsEditing(false);
        setMessage("School profile updated successfully!");
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(`Update failed: ${error.response.data.error}`);
      } else {
        setMessage("Failed to update school profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    fetchSchool();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading && !schoolData.name) {
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
        <div className="mb-8">
          <button
            onClick={() => navigate("/institute/home")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-medium group cursor-pointer mb-6"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Dashboard</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {schoolData.name}
            </h1>
            <p className="text-gray-600 text-lg">
              {schoolData.display_name || "Educational Institution"}
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Institution Details
              </h2>
              <p className="text-gray-600">
                Manage your institution's information and details
              </p>
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
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-5 w-5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                School Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  value={schoolData.name}
                  disabled
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                School name cannot be changed
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={schoolData.display_name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                  placeholder="Public display name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Registration Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    name="registration_number"
                    value={schoolData.registration_number || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    name="contact_person_name"
                    value={schoolData.contact_person_name || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="email"
                    name="contact_email"
                    value={schoolData.contact_email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                      errors.contact_email
                        ? "border-rose-500/50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.contact_email && (
                  <p className="text-rose-500 text-sm mt-2">
                    {errors.contact_email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="tel"
                    name="contact_phone"
                    value={schoolData.contact_phone || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                      errors.contact_phone
                        ? "border-rose-500/50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.contact_phone && (
                  <p className="text-rose-500 text-sm mt-2">
                    {errors.contact_phone}
                  </p>
                )}
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
                    value={schoolData.website || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Address
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={schoolData.street || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={schoolData.city || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`px-4 py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 ${
                    errors.city ? "border-rose-500/50" : "border-gray-300"
                  }`}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={schoolData.state || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={schoolData.pincode || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                />
              </div>
              {errors.city && (
                <p className="text-rose-500 text-sm mt-2">{errors.city}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Logo URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="text"
                    name="logo_url"
                    value={schoolData.logo_url || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 cursor-pointer">
                  Institution Logo
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="file"
                    name="logo"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl border bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 cursor-pointer focus:ring-gray-500/50 focus:border-gray-500/30 text-sm sm:text-base ${
                      errors.logo
                        ? "border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/30"
                        : "border-gray-300"
                    } ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                {errors.logo && (
                  <p className="text-rose-500 text-xs sm:text-sm mt-1">
                    {errors.logo}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-6 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <textarea
                  name="description"
                  rows="4"
                  value={schoolData.description || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/30 resize-none"
                  placeholder="Write a short description about your institution"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Created At
                </label>
                <input
                  type="text"
                  value={formatDate(schoolData.created_at)}
                  disabled
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Country
                </label>
                <input
                  type="text"
                  value={schoolData.country || "India"}
                  disabled
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Institution Status
          </h2>
          <div className="flex items-center space-x-3 bg-gray-100 p-4 rounded-xl">
            <Shield className="h-6 w-6 text-gray-600" />
            <div>
              <p className="text-gray-600 font-medium">Active Institution</p>
              <p className="text-sm text-gray-500">
                Registered on {formatDate(schoolData.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteProfile;
