// src/pages/InstituteProfile.jsx
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
  Shield,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams(); // use :id if route like /schools/:id

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`http://localhost:4000/api/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchoolData(response.data.school);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school:", error);
      setMessage("Failed to load school profile");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchoolData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!schoolData.name.trim()) newErrors.name = "School name is required";
    if (!schoolData.contact_email.trim())
      newErrors.contact_email = "Contact email is required";
    if (!schoolData.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");
      const response = await axios.put(
        `http://localhost:4000/api/schools/${id}`,
        schoolData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSchoolData(response.data.school);
      setIsEditing(false);
      setMessage("School profile updated successfully!");
    } catch (error) {
      console.error("Error updating school:", error);
      setMessage("Failed to update school profile");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (isLoading && !schoolData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-6">
        <button
          onClick={() => navigate("/institute/home")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 font-medium group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Institution Profile
          </h1>
          <p className="text-gray-600">
            Manage your institution’s information and details
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">School Details</h2>
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
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{isLoading ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-300"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  name="name"
                  value={schoolData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50 focus:ring-2"
                />
              </div>
              {errors.name && <p className="text-rose-500 text-sm">{errors.name}</p>}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={schoolData.display_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-4 rounded-xl border bg-gray-50"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Number
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  name="registration_number"
                  value={schoolData.registration_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="url"
                  name="website"
                  value={schoolData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person_name"
                value={schoolData.contact_person_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-4 rounded-xl border bg-gray-50"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="email"
                  name="contact_email"
                  value={schoolData.contact_email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
              {errors.contact_email && (
                <p className="text-rose-500 text-sm">{errors.contact_email}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="tel"
                  name="contact_phone"
                  value={schoolData.contact_phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={schoolData.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border bg-gray-50"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={schoolData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border bg-gray-50"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={schoolData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border bg-gray-50"
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={schoolData.pincode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="px-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
              {errors.city && <p className="text-rose-500 text-sm">{errors.city}</p>}
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  name="logo_url"
                  value={schoolData.logo_url}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-6 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <textarea
                  name="description"
                  rows="4"
                  value={schoolData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border bg-gray-50"
                  placeholder="Write a short description about your institution"
                />
              </div>
            </div>

            {/* Metadata: created_at */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Created At
              </label>
              <input
                type="text"
                value={formatDate(schoolData.created_at)}
                disabled
                className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Verification</h2>
          <div className="flex items-center space-x-3 bg-gray-100 p-4 rounded-xl">
            <Shield className="h-6 w-6 text-gray-600" />
            <p className="text-gray-600">
              {schoolData.verified
                ? `Verified at ${formatDate(schoolData.verified_at)}`
                : "Not verified yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteProfile;
