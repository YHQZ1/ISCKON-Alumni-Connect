import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  TrendingUp,
  Share2,
  BookOpen,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  UsersRound
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const InstituteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    fetchSchoolData();
  }, [id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("jwtToken");
      
      // Fetch school details
      const schoolResponse = await axios.get(`${BASE_URL}/api/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch campaigns for this school
      const campaignsResponse = await axios.get(
        `${BASE_URL}/api/campaigns?school_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSchool(schoolResponse.data.school);
      setCampaigns(campaignsResponse.data.campaigns || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching school data:", err);
      setError("Failed to load school details. Please try again.");
      setLoading(false);
    }
  };

  const handleDonate = (campaignId) => {
    // Navigate to donation page or open donation modal
    console.log("Donate to campaign:", campaignId);
    // You can implement donation flow here
    navigate(`/donate/${campaignId}`);
  };

  const handleShare = async (campaign) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.short_description,
          url: `${window.location.origin}/campaign/${campaign.id}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/campaign/${campaign.id}`);
      alert('Campaign link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = (current, target) => {
    return target > 0 ? Math.round((current / target) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSchoolData}
              className="bg-gray-800 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">School not found.</p>
          <button
            onClick={() => navigate("/alumni/home")}
            className="bg-gray-800 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(camp => camp.status === 'active');
  const completedCampaigns = campaigns.filter(camp => camp.status === 'completed');
  const totalRaised = campaigns.reduce((sum, camp) => sum + (camp.current_amount || 0), 0);
  const totalNeeded = campaigns.reduce((sum, camp) => sum + (camp.target_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/alumni/home")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-2xl hover:bg-gray-700 transition-all duration-300">
                <Share2 className="h-4 w-4" />
                <span>Share School</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* School Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* School Image and Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={school.logo_url || "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop"}
                    alt={school.name}
                    className="w-32 h-32 rounded-2xl object-cover border border-gray-200"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {school.name}
                  </h1>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {[school.street, school.city, school.state, school.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {school.description || "This institution is dedicated to providing quality education and fostering academic excellence."}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {activeCampaigns.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Needs</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${totalRaised.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Raised</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {school.metadata?.alumni_count || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">Alumni</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {completedCampaigns.length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:w-80 bg-gray-50 rounded-3xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                {school.contact_person_name && (
                  <div className="flex items-center text-gray-600">
                    <UsersRound className="h-4 w-4 mr-3" />
                    <span>{school.contact_person_name}</span>
                  </div>
                )}
                
                {school.contact_email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3" />
                    <a href={`mailto:${school.contact_email}`} className="hover:text-gray-800">
                      {school.contact_email}
                    </a>
                  </div>
                )}
                
                {school.contact_phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3" />
                    <a href={`tel:${school.contact_phone}`} className="hover:text-gray-800">
                      {school.contact_phone}
                    </a>
                  </div>
                )}
                
                {school.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-3" />
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-gray-800 flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                activeTab === "campaigns"
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Active Needs ({activeCampaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                activeTab === "about"
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              About School
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                activeTab === "completed"
                  ? "border-gray-800 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed Projects ({completedCampaigns.length})
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {activeTab === "campaigns" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Funding Needs</h2>
              
              {activeCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
                    <p className="text-gray-600">This school doesn't have any active funding needs at the moment.</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                            {campaign.title}
                          </h3>
                          <button
                            onClick={() => handleShare(campaign)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {campaign.short_description || campaign.body || "Support this important initiative to help the school community."}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>
                              ${campaign.current_amount?.toLocaleString() || 0} of $
                              {campaign.target_amount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-800 h-2 rounded-full transition-all duration-700"
                              style={{
                                width: `${getProgressPercentage(
                                  campaign.current_amount || 0,
                                  campaign.target_amount
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getProgressPercentage(
                              campaign.current_amount || 0,
                              campaign.target_amount
                            )}% funded
                          </div>
                        </div>

                        {/* Campaign Details */}
                        <div className="space-y-2 mb-4">
                          {campaign.start_at && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Started {formatDate(campaign.start_at)}</span>
                            </div>
                          )}
                          
                          {campaign.end_at && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{getDaysRemaining(campaign.end_at)} days remaining</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDonate(campaign.id)}
                            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 group-hover:scale-105"
                          >
                            <Heart className="h-4 w-4" />
                            <span>Donate Now</span>
                          </button>
                          
                          <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold flex items-center justify-center">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {school.name}</h2>
              
              <div className="bg-white rounded-3xl border border-gray-200 p-8">
                <div className="prose prose-gray max-w-none">
                  {school.description ? (
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {school.description}
                    </p>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No description available for this school.</p>
                    </div>
                  )}
                  
                  {/* Additional School Details */}
                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
                      <div className="space-y-3">
                        {school.registration_number && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Registration No:</span>
                            <p className="text-gray-900">{school.registration_number}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm font-medium text-gray-500">Location:</span>
                          <p className="text-gray-900">
                            {[school.street, school.city, school.state, school.pincode, school.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Impact Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Campaigns:</span>
                          <span className="font-semibold">{campaigns.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Funds Raised:</span>
                          <span className="font-semibold">${totalRaised.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Needs:</span>
                          <span className="font-semibold">{activeCampaigns.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "completed" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Projects</h2>
              
              {completedCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Projects</h3>
                    <p className="text-gray-600">This school hasn't completed any projects yet.</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                            {campaign.title}
                          </h3>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>

                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {campaign.short_description || campaign.body || "This project has been successfully completed."}
                        </p>

                        {/* Final Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Final Amount</span>
                            <span className="font-semibold text-green-600">
                              ${campaign.current_amount?.toLocaleString() || 0} raised
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                        </div>

                        {/* Completion Details */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {campaign.end_at && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Completed {formatDate(campaign.end_at)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            <span>100% funded successfully</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InstituteDetails;