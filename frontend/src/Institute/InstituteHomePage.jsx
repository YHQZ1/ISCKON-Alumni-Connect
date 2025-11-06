import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Building,
  Star,
  LogOut,
  Bell,
  Settings,
  IndianRupee,
  Target,
  Plus,
  Edit,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Tag,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const InstituteHomePage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentInstitution, setCurrentInstitution] = useState(null);
  const [fundingNeeds, setFundingNeeds] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("needs");
  const [showAddNeedModal, setShowAddNeedModal] = useState(false);
  const [newNeedData, setNewNeedData] = useState({
    title: "",
    description: "",
    category: "Learning Resources",
    goalAmount: "",
    urgency: "medium",
    image: "",
  });
  const [showEditNeedModal, setShowEditNeedModal] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [editNeedData, setEditNeedData] = useState({
    title: "",
    description: "",
    category: "Learning Resources",
    goalAmount: "",
    urgency: "medium",
    image: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNeed, setDeletingNeed] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const observerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        const res = await axios.get("/api/institution");
        setCurrentInstitution(res.data.institution);
        setFundingNeeds(res.data.fundingNeeds);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutionData();
  }, []);

  useEffect(() => {
    fetchInstituteData();
  }, []);

  // useEffect(() => {
  //   const fetchRecentDonations = async () => {
  //     try {
  //       const token = localStorage.getItem("jwtToken");
  //       const response = await axios.get(
  //         `${BASE_URL}/api/donations?school_id=${currentInstitution?.schoolId}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       setRecentDonations(response.data.donations || []);
  //     } catch (err) {
  //       console.error("Failed to fetch recent donations", err);
  //     }
  //   };

  //   if (currentInstitution?.schoolId) {
  //     fetchRecentDonations();
  //   }
  // }, [currentInstitution?.schoolId]);

  const CATEGORY_IMAGES = {
    "Learning Resources": "/category/learning-resources.png",
    STEM: "/category/stem.png",
    Technology: "/category/technology.png",
    Sports: "/category/sports.png",
    Arts: "/category/arts.png",
    Facilities: "/category/facilities.png",
    General: "/category/general.png",
  };

  // Notification Component
  const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const getBackgroundColor = () => {
      switch (type) {
        case "success":
          return "bg-white-500";
        case "error":
          return "bg-red-500";
        case "warning":
          return "bg-yellow-500";
        default:
          return "bg-gray-800";
      }
    };

    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle className="h-5 w-5" />;
        case "error":
          return <AlertCircle className="h-5 w-5" />;
        default:
          return <CheckCircle className="h-5 w-5" />;
      }
    };

    return (
      <div
        className={`fixed top-20 right-4 z-50 ${getBackgroundColor()} text-black px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 transform animate-slide-in`}
      >
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-2 w-[95%] h-1 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-black/80 rounded-full animate-progress"
            style={{ animationDuration: "4s" }}
          />
        </div>
      </div>
    );
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const fetchInstituteData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("jwtToken");

      const userResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userResponse.data.user;

      const schoolsResponse = await axios.get(`${BASE_URL}/api/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userSchools = schoolsResponse.data.schools;
      const userSchool = userSchools.find(
        (school) => school.owner_id === userData.id
      );

      console.log("🔍 Raw logo_url from API:", userSchool?.logo_url);

      const getLogoUrl = (logoUrl) => {
        if (!logoUrl) return null;
        if (logoUrl.startsWith("http")) return logoUrl;
        if (logoUrl.startsWith("blob:")) return logoUrl;
        if (logoUrl.startsWith("/")) {
          return `${BASE_URL}${logoUrl}`;
        }
        return `${BASE_URL}/${logoUrl}`;
      };

      const campaignsResponse = await axios.get(
        `${BASE_URL}/api/campaigns?school_id=${userSchool.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch donor counts for each campaign using campaign routes
      const campaignsWithDonors = await Promise.all(
        campaignsResponse.data.campaigns.map(async (campaign) => {
          try {
            // ✅ Now using the campaign donor count endpoint
            const donorCountResponse = await axios.get(
              `${BASE_URL}/api/campaigns/${campaign.id}/donor-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.short_description || campaign.body || "",
              goalAmount: campaign.target_amount,
              raisedAmount: campaign.current_amount,
              donors: donorCountResponse.data.donorCount || 0, // ✅ Actual donor count
              status: campaign.status,
              category: campaign.metadata?.category || "General",
              dateCreated: campaign.created_at
                ? campaign.created_at.split("T")[0]
                : new Date().toISOString().split("T")[0],
              urgency: campaign.metadata?.urgency || "medium",
              image:
                campaign.metadata?.image ||
                CATEGORY_IMAGES[campaign.metadata?.category] ||
                CATEGORY_IMAGES.General,
            };
          } catch (error) {
            console.error(
              `Error fetching donor count for campaign ${campaign.id}:`,
              error
            );
            // Return campaign with 0 donors if there's an error
            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.short_description || campaign.body || "",
              goalAmount: campaign.target_amount,
              raisedAmount: campaign.current_amount,
              donors: 0,
              status: campaign.status,
              category: campaign.metadata?.category || "General",
              dateCreated: campaign.created_at
                ? campaign.created_at.split("T")[0]
                : new Date().toISOString().split("T")[0],
              urgency: campaign.metadata?.urgency || "medium",
              image:
                campaign.metadata?.image ||
                CATEGORY_IMAGES[campaign.metadata?.category] ||
                CATEGORY_IMAGES.General,
            };
          }
        })
      );

      // Calculate total donors across all campaigns
      const totalDonors = campaignsWithDonors.reduce(
        (sum, need) => sum + (need.donors || 0),
        0
      );

      const totalRaised = campaignsWithDonors.reduce(
        (sum, need) => sum + (need.raisedAmount || 0),
        0
      );

      const dynamicInstitution = {
        name:
          userSchool.name || userData.institution_name || "Your Institution",
        location:
          `${userSchool.city || ""}, ${userSchool.state || ""}`.trim() ||
          userData.location ||
          "Location not set",
        type: "Educational Institution",
        established: 2007,
        totalStudents: 0,
        alumniCount: 0,
        description:
          userSchool.description ||
          "Supporting education with quality resources.",
        logo: getLogoUrl(userSchool?.logo_url),
        totalRaised,
        totalDonors, // ✅ Now this will show the actual total donor count
        activeNeeds: campaignsWithDonors.filter(
          (need) => need.status === "active"
        ).length,
        completedProjects: campaignsWithDonors.filter(
          (need) => need.status === "completed"
        ).length,
        schoolId: userSchool.id,
      };

      console.log("🔍 Final logo URL:", dynamicInstitution.logo);
      console.log("📊 Total donors calculated:", totalDonors);

      setCurrentInstitution(dynamicInstitution);
      setFundingNeeds(campaignsWithDonors);
    } catch (error) {
      console.error("Error fetching institute data:", error);
      if (!error.message.includes("No school found")) {
        showNotification(
          "Failed to load data. Using demo data instead.",
          "warning"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickStats = [
    {
      label: "Total Raised",
      value: `₹${currentInstitution?.totalRaised?.toLocaleString() || "0"}`,
      icon: IndianRupee,
      color: "text-gray-900",
    },
    {
      label: "Active Needs",
      value: currentInstitution?.activeNeeds || 0,
      icon: Target,
      color: "text-gray-900",
    },
    {
      label: "Completed Projects",
      value: currentInstitution?.completedProjects || 0,
      icon: CheckCircle,
      color: "text-gray-900",
    },
    {
      label: "Total Donors",
      value: currentInstitution?.totalDonors || 0,
      icon: Users,
      color: "text-gray-900",
    },
  ];

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const averageCompletion =
    Array.isArray(fundingNeeds) && fundingNeeds.length
      ? Math.round(
          fundingNeeds.reduce(
            (sum, need) => sum + (need.raisedAmount / need.goalAmount) * 100,
            0
          ) / fundingNeeds.length
        )
      : 0;

  const handleAddNeedSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("jwtToken");

      if (!currentInstitution?.schoolId) {
        throw new Error(
          "School ID not found. Please refresh the page or create a school first."
        );
      }

      const finalImage = newNeedData.image.trim()
        ? newNeedData.image
        : CATEGORY_IMAGES[newNeedData.category] || CATEGORY_IMAGES.General;

      const response = await axios.post(
        `${BASE_URL}/api/campaigns`,
        {
          school_id: currentInstitution.schoolId,
          title: newNeedData.title,
          short_description: newNeedData.description,
          body: newNeedData.description,
          target_amount: parseInt(newNeedData.goalAmount),
          currency: "INR",
          metadata: {
            category: newNeedData.category,
            urgency: newNeedData.urgency,
            image: finalImage,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const campaignsResponse = await axios.get(
        `${BASE_URL}/api/campaigns?school_id=${currentInstitution.schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedFundingNeeds = campaignsResponse.data.campaigns.map(
        (campaign) => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.short_description || campaign.body || "",
          goalAmount: campaign.target_amount,
          raisedAmount: campaign.current_amount,
          donors: 0,
          status: campaign.status,
          category: campaign.metadata?.category || "General",
          dateCreated: campaign.created_at
            ? campaign.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
          urgency: campaign.metadata?.urgency || "medium",
          image: campaign.metadata?.image || CATEGORY_IMAGES.General,
        })
      );

      setCurrentInstitution((prev) => ({
        ...prev,
        activeNeeds: updatedFundingNeeds.filter(
          (need) => need.status === "active"
        ).length,
        completedProjects: updatedFundingNeeds.filter(
          (need) => need.status === "completed"
        ).length,
      }));

      setFundingNeeds(updatedFundingNeeds);
      setShowAddNeedModal(false);
      setNewNeedData({
        title: "",
        description: "",
        category: "Learning Resources",
        goalAmount: "",
        urgency: "medium",
        image: "",
      });

      showNotification("Funding need created successfully!", "success");
    } catch (error) {
      console.error("Error creating funding need:", error);
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(
        `Failed to create funding need: ${errorMessage}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNeed = (need) => {
    setEditingNeed(need);
    setEditNeedData({
      title: need.title,
      description: need.description,
      category: need.category,
      goalAmount: need.goalAmount.toString(),
      urgency: need.urgency,
      image: "",
    });
    setShowEditNeedModal(true);
  };

  const handleEditNeedSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      const token = localStorage.getItem("jwtToken");

      const finalImage = editNeedData.image.trim()
        ? editNeedData.image
        : CATEGORY_IMAGES[editNeedData.category] || CATEGORY_IMAGES.General;

      const response = await axios.put(
        `${BASE_URL}/api/campaigns/${editingNeed.id}`,
        {
          title: editNeedData.title,
          short_description: editNeedData.description,
          body: editNeedData.description,
          target_amount: parseInt(editNeedData.goalAmount),
          metadata: {
            category: editNeedData.category,
            urgency: editNeedData.urgency,
            image: finalImage,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh the funding needs list
      const campaignsResponse = await axios.get(
        `${BASE_URL}/api/campaigns?school_id=${currentInstitution.schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedFundingNeeds = campaignsResponse.data.campaigns.map(
        (campaign) => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.short_description || campaign.body || "",
          goalAmount: campaign.target_amount,
          raisedAmount: campaign.current_amount,
          donors: 0,
          status: campaign.status,
          category: campaign.metadata?.category || "General",
          dateCreated: campaign.created_at
            ? campaign.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
          urgency: campaign.metadata?.urgency || "medium",
          image: campaign.metadata?.image || CATEGORY_IMAGES.General,
        })
      );

      setFundingNeeds(updatedFundingNeeds);
      setShowEditNeedModal(false);
      setEditingNeed(null);
      setEditNeedData({
        title: "",
        description: "",
        category: "Learning Resources",
        goalAmount: "",
        urgency: "medium",
        image: "",
      });

      showNotification("Funding need updated successfully!", "success");
    } catch (error) {
      console.error("Error updating funding need:", error);
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(
        `Failed to update funding need: ${errorMessage}`,
        "error"
      );
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteNeed = (need) => {
    setDeletingNeed(need);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("jwtToken");

      await axios.delete(`${BASE_URL}/api/campaigns/${deletingNeed.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the funding needs list
      const campaignsResponse = await axios.get(
        `${BASE_URL}/api/campaigns?school_id=${currentInstitution.schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedFundingNeeds = campaignsResponse.data.campaigns.map(
        (campaign) => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.short_description || campaign.body || "",
          goalAmount: campaign.target_amount,
          raisedAmount: campaign.current_amount,
          donors: 0,
          status: campaign.status,
          category: campaign.metadata?.category || "General",
          dateCreated: campaign.created_at
            ? campaign.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
          urgency: campaign.metadata?.urgency || "medium",
          image: campaign.metadata?.image || CATEGORY_IMAGES.General,
        })
      );

      setFundingNeeds(updatedFundingNeeds);

      // Update institution stats
      setCurrentInstitution((prev) => ({
        ...prev,
        activeNeeds: updatedFundingNeeds.filter(
          (need) => need.status === "active"
        ).length,
        completedProjects: updatedFundingNeeds.filter(
          (need) => need.status === "completed"
        ).length,
      }));

      setShowDeleteModal(false);
      setDeletingNeed(null);

      showNotification("Funding need deleted successfully!");
    } catch (error) {
      console.error("Error deleting funding need:", error);
      const errorMessage = error.response?.data?.error || error.message;
      showNotification(`Failed to delete funding need: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-xl shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Left - Branding - Now visible on mobile too */}
            <div className="flex items-center space-x-3 lg:space-x-4 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-md">
                  <Building className="h-5 w-5 lg:h-7 lg:w-7 text-gray-50 transform transition-transform duration-300" />
                </div>
              </div>
              <div className="block sm:block">
                <span className="text-lg lg:text-2xl font-bold text-gray-900">
                  Institution Portal
                </span>
                <div className="text-xs lg:text-sm text-gray-600 font-medium">
                  Manage Your School's Needs
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-800 transition-colors p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer" />
              <div
                onClick={() =>
                  navigate(`/institute/profile/${currentInstitution?.schoolId}`)
                }
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {currentInstitution?.logo ? (
                  <img
                    src={currentInstitution.logo}
                    alt={currentInstitution.name}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-gray-400 rounded-xl border p-1" />
                )}

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {currentInstitution?.display_name ||
                      currentInstitution?.name}
                  </div>
                  <div className="text-xs text-gray-500">Admin Portal</div>
                </div>

                <Settings className="h-5 w-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-red-100 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu - Added Notification Bell here */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  {currentInstitution?.logo ? (
                    <img
                      src={currentInstitution.logo}
                      alt={currentInstitution.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-gray-400 rounded-xl border p-1" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {currentInstitution?.display_name ||
                        currentInstitution?.name}
                    </div>
                    <div className="text-xs text-gray-500">Admin Portal</div>
                  </div>
                </div>

                {/* Notification Bell in Mobile Menu */}
                <button
                  onClick={() => {
                    // Add your notification handler here
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </button>

                <button
                  onClick={() => {
                    navigate(
                      `/institute/profile/${currentInstitution?.schoolId}`
                    );
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome Section */}
      <section
        className="pt-20 lg:pt-24 pb-8 lg:pb-12 relative overflow-hidden"
        id="welcome"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible.welcome
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
              <div className="flex-1 w-full">
                <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 shadow-sm mb-4 lg:mb-6 hover:scale-105 transition-transform duration-300">
                  <Star className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700 animate-pulse" />
                  <span className="text-xs lg:text-sm font-semibold text-gray-800">
                    Institution Admin Dashboard
                  </span>
                </div>

                <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight text-gray-900">
                  {currentInstitution?.name}
                  <br />
                  <span className="text-gray-800">Fundraising Management</span>
                </h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {quickStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/60 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <IconComponent
                          className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color} mb-1 lg:mb-2`}
                        />
                        <div className="text-lg lg:text-2xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* <div className="flex-1 lg:flex-none w-full lg:w-96 mt-8 lg:mt-0">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-3 lg:space-y-4 max-h-60 lg:max-h-80 overflow-y-auto">
                    {recentDonations?.slice(0, 4).map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 lg:p-3 rounded-lg lg:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">
                            {donation.anonymous ? "Anonymous" : donation.donor}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {donation.project}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-sm font-bold text-gray-800">
                            ₹{donation.amount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 lg:mt-4 text-center text-gray-700 hover:text-gray-900 font-semibold text-xs lg:text-sm transition-colors duration-300">
                    View All Donations →
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section
        className="py-4 lg:py-8 bg-white/80 backdrop-blur-sm border-y border-gray-200"
        id="tabs"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {["needs", "profile", "analytics"].map((tab) => (
              <button
                key={tab}
                className={`px-3 lg:px-4 py-2 text-sm lg:text-lg cursor-pointer font-semibold rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "needs" && "Funding Needs"}
                {tab === "profile" && "Institution Profile"}
                {tab === "analytics" && "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="content" className="py-8 lg:py-12 bg-gray-100" data-animate>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "needs" && (
            <div className="space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Funding <span className="text-gray-800">Needs</span>
                </h2>
                <button
                  onClick={() => setShowAddNeedModal(true)}
                  className="bg-gray-800 text-white cursor-pointer px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span>Add New Need</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {fundingNeeds?.map((need, index) => (
                  <div
                    key={need.id}
                    className={`group bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] ${
                      isVisible.content
                        ? "translate-y-0 opacity-100"
                        : "translate-y-20 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={need.image}
                        alt={need.title}
                        className="w-full h-40 lg:h-48 object-cover transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 group-hover:from-gray-900/40 transition-all duration-500"></div>

                      <div className="absolute top-3 lg:top-4 right-3 lg:right-4 bg-white/95 backdrop-blur-sm rounded-xl lg:rounded-2xl px-2 lg:px-3 py-1 border border-gray-300 shadow-sm">
                        <span
                          className={`text-xs font-bold ${
                            need.status === "active"
                              ? "text-gray-800"
                              : "text-gray-600"
                          }`}
                        >
                          {need.status === "active" ? "ACTIVE" : "COMPLETED"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300 line-clamp-2">
                        {need.title}
                      </h3>

                      <div className="flex items-center text-gray-600 mb-3">
                        <Tag className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 text-gray-500" />
                        <span className="text-xs lg:text-sm font-medium">
                          {need.category}
                        </span>
                      </div>

                      <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed line-clamp-3">
                        {need.description}
                      </p>

                      <div className="mb-3 lg:mb-4">
                        <div className="flex justify-between text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
                          <span>Progress</span>
                          <span className="text-right">
                            ₹{need.raisedAmount.toLocaleString()} of ₹
                            {need.goalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
                          <div
                            className={`h-1.5 lg:h-2 rounded-full transition-all duration-700 ${
                              need.status === "completed"
                                ? "bg-gray-800"
                                : "bg-gray-700"
                            }`}
                            style={{
                              width: `${
                                (need.raisedAmount / need.goalAmount) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(
                            (need.raisedAmount / need.goalAmount) * 100
                          )}
                          % funded • {need.donors} donors
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleEditNeed(need)}
                          className="bg-gray-800 text-white px-2 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center justify-center space-x-1 text-xs sm:text-sm cursor-pointer"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNeed(need)}
                          className="border border-red-300 text-red-600 rounded-xl lg:rounded-2xl hover:bg-red-50 hover:border-red-400 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center space-x-1 text-xs sm:text-sm cursor-pointer"
                        >
                          <X className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Delete</span>
                        </button>
                        <button className="border border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center space-x-1 text-xs sm:text-sm cursor-pointer">
                          <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>Analytics</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-8 border border-gray-200">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">
                Institution <span className="text-gray-800">Profile</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution?.name}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution?.location}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Type
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution?.type}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Established
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution?.established}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Students
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution?.totalStudents}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alumni Count
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={
                        currentInstitution?.alumniCount?.toLocaleString() || "0"
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="w-full bg-gray-100 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 min-h-24 lg:min-h-32">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentInstitution?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-sm p-4 lg:p-8 border border-gray-200">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">
                Fundraising <span className="text-gray-800">Analytics</span>
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-gray-300">
                  <div className="text-xl lg:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">
                    ₹{currentInstitution?.totalRaised?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-700 font-medium">
                    Total Raised
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-gray-300">
                  <div className="text-xl lg:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">
                    {currentInstitution?.totalDonors?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-700 font-medium">
                    Total Donors
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-gray-300 col-span-2 lg:col-span-1">
                  <div className="text-xl lg:text-3xl font-bold text-gray-800 mb-1 lg:mb-2">
                    {averageCompletion}%
                  </div>
                  <div className="text-xs lg:text-sm text-gray-700 font-medium">
                    Average Completion
                  </div>
                </div>
              </div>

              <div className="mb-6 lg:mb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3 lg:mb-4">
                  Donations Over Time
                </h3>
                <div className="bg-gray-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 h-48 lg:h-64 flex items-center justify-center">
                  <div className="text-gray-400 text-sm lg:text-base">
                    Chart visualization would appear here
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3 lg:mb-4">
                    Top Funding Needs
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    {fundingNeeds
                      ?.filter((need) => need.status === "active")
                      .slice(0, 5)
                      .map((need, index) => (
                        <div
                          key={need.id}
                          className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-200"
                        >
                          <div className="text-sm font-medium text-gray-800 truncate flex-1 mr-2">
                            {need.title}
                          </div>
                          <div className="text-sm font-bold text-gray-700 flex-shrink-0">
                            {Math.round(
                              (need.raisedAmount / need.goalAmount) * 100
                            )}
                            %
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3 lg:mb-4">
                    Recent Donor Activity
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    {recentDonations?.slice(0, 5).map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {donation.anonymous ? "Anonymous" : donation.donor}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {donation.project}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-800 flex-shrink-0 ml-2">
                          ₹{donation.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add New Need Modal */}
      {showAddNeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Add New Funding Need
                </h3>
                <button
                  onClick={() => setShowAddNeedModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddNeedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNeedData.title}
                    onChange={(e) =>
                      setNewNeedData({ ...newNeedData, title: e.target.value })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., New Library Books, Science Lab Equipment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newNeedData.description}
                    onChange={(e) =>
                      setNewNeedData({
                        ...newNeedData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 h-24 lg:h-32"
                    placeholder="Describe what this funding need is for and how it will help..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newNeedData.category}
                      onChange={(e) =>
                        setNewNeedData({
                          ...newNeedData,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="Learning Resources">
                        Learning Resources
                      </option>
                      <option value="STEM">STEM</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Technology">Technology</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level *
                    </label>
                    <select
                      value={newNeedData.urgency}
                      onChange={(e) =>
                        setNewNeedData({
                          ...newNeedData,
                          urgency: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newNeedData.goalAmount}
                    onChange={(e) =>
                      setNewNeedData({
                        ...newNeedData,
                        goalAmount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Image URL (Optional)
                    <span className="text-xs text-gray-500 ml-1">
                      - Leave empty to use category default
                    </span>
                  </label>
                  <input
                    type="url"
                    value={newNeedData.image}
                    onChange={(e) =>
                      setNewNeedData({ ...newNeedData, image: e.target.value })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddNeedModal(false)}
                    className="px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Need</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Need Modal */}
      {showEditNeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Edit Funding Need
                </h3>
                <button
                  onClick={() => {
                    setShowEditNeedModal(false);
                    setEditingNeed(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditNeedSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNeedData.title}
                    onChange={(e) =>
                      setEditNeedData({
                        ...editNeedData,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., New Library Books, Science Lab Equipment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={editNeedData.description}
                    onChange={(e) =>
                      setEditNeedData({
                        ...editNeedData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 h-24 lg:h-32"
                    placeholder="Describe what this funding need is for and how it will help..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={editNeedData.category}
                      onChange={(e) =>
                        setEditNeedData({
                          ...editNeedData,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="Learning Resources">
                        Learning Resources
                      </option>
                      <option value="STEM">STEM</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Technology">Technology</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level *
                    </label>
                    <select
                      value={editNeedData.urgency}
                      onChange={(e) =>
                        setEditNeedData({
                          ...editNeedData,
                          urgency: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editNeedData.goalAmount}
                    onChange={(e) =>
                      setEditNeedData({
                        ...editNeedData,
                        goalAmount: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Image URL (Optional)
                    <span className="text-xs text-gray-500 ml-1">
                      - Leave empty to use category default
                    </span>
                  </label>
                  <input
                    type="url"
                    value={editNeedData.image}
                    onChange={(e) =>
                      setEditNeedData({
                        ...editNeedData,
                        image: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditNeedModal(false);
                      setEditingNeed(null);
                    }}
                    className="px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="bg-gray-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    {isEditing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Update Need</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 lg:p-8">
              {/* Header with subtle warning icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                  Delete Campaign
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                    {deletingNeed?.title}
                  </span>
                  ? This action cannot be undone and all associated data will be
                  permanently removed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingNeed(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold hover:scale-105 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl lg:rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 4s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default InstituteHomePage;
