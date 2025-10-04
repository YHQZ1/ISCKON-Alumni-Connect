import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  MapPin,
  Users,
  Building,
  ArrowRight,
  Star,
  Globe,
  GraduationCap,
  Eye,
  LogOut,
  User,
  Bell,
  Settings,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  ChevronRight,
  Filter,
  SortDesc,
  IndianRupee,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AlumniHomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef();
  const animationRef = useRef(null);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: "",
    batch: "",
    school: "",
    totalDonated: 0,
    projectsSupported: 0,
    avatar: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [featuredInstitutions, setFeaturedInstitutions] = useState([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [institutionsError, setInstitutionsError] = useState(null);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

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
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchFeaturedInstitutions();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;
      setCurrentUser({
        name: `${userData.first_name} ${userData.last_name}`,
        batch: userData.graduation_year
          ? `Class of ${userData.graduation_year}`
          : "Alumni",
        school: userData.institution_name || "Your School",
        totalDonated: 0,
        projectsSupported: 0,
        avatar: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  const fetchFeaturedInstitutions = async () => {
    try {
      setInstitutionsLoading(true);
      setInstitutionsError(null);

      const token = localStorage.getItem("jwtToken");

      const [schoolsResponse, campaignsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const schools = schoolsResponse.data.schools;
      const campaigns = campaignsResponse.data.campaigns;

      const campaignsBySchool = {};
      campaigns.forEach((campaign) => {
        if (!campaignsBySchool[campaign.school_id]) {
          campaignsBySchool[campaign.school_id] = [];
        }
        campaignsBySchool[campaign.school_id].push(campaign);
      });

      const transformedInstitutions = schools.map((school, index) => {
        const schoolCampaigns = campaignsBySchool[school.id] || [];
        const activeCampaigns = schoolCampaigns.filter(
          (camp) => camp.status === "active"
        );

        const totalNeeded = activeCampaigns.reduce(
          (sum, camp) => sum + (camp.target_amount || 0),
          0
        );
        const totalRaised = activeCampaigns.reduce(
          (sum, camp) => sum + (camp.current_amount || 0),
          0
        );

        const urgentCampaign = activeCampaigns.sort(
          (a, b) =>
            b.target_amount -
            b.current_amount -
            (a.target_amount - a.current_amount)
        )[0];

        return {
          id: school.id,
          name: school.name,
          location:
            `${school.city || ""}${school.city && school.state ? ", " : ""}${
              school.state || ""
            }`.trim() || "Location not specified",
          image: school.logo_url || getDefaultImage(index),
          needs: activeCampaigns.length,
          alumni: school.metadata?.alumni_count || 0,
          totalNeeded: totalNeeded || 0,
          raised: totalRaised || 0,
          urgentNeed: urgentCampaign?.title || getDefaultUrgentNeed(index),
          urgentAmount: urgentCampaign
            ? urgentCampaign.target_amount - urgentCampaign.current_amount
            : 0,
          category: school.metadata?.category || getDefaultCategory(index),
          recentUpdate: getRecentUpdate(activeCampaigns, school.created_at),
          description:
            school.description ||
            school.short_description ||
            "Supporting education and development for future generations.",
          campaigns: activeCampaigns,
          schoolData: school,
        };
      });

      setFeaturedInstitutions(transformedInstitutions);
      setInstitutionsLoading(false);
    } catch (error) {
      console.error("Error fetching featured institutions:", error);
      setInstitutionsError(
        "Failed to load institutions. Please try again later."
      );
      setInstitutionsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const token = localStorage.getItem("jwtToken");

      const response = await axios.get(
        `${BASE_URL}/api/users/recent-activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const activities = response.data.activities.map((activity) => {
        let transformedActivity = {
          id: activity.id,
          type: activity.type,
          school: activity.school_name,
          date: formatTimeAgo(activity.created_at),
          created_at: activity.created_at,
        };

        switch (activity.type) {
          case "donation":
            transformedActivity = {
              ...transformedActivity,
              amount: activity.amount,
              project: activity.campaign_title,
              icon: Heart,
            };
            break;
          case "milestone":
            transformedActivity = {
              ...transformedActivity,
              project: activity.campaign_title,
              milestone: activity.milestone,
              icon: Target,
            };
            break;
          case "update":
            transformedActivity = {
              ...transformedActivity,
              update: activity.update_text,
              icon: TrendingUp,
            };
            break;
          case "campaign_created":
            transformedActivity = {
              ...transformedActivity,
              project: activity.campaign_title,
              action: "New campaign created",
              icon: Award,
            };
            break;
          default:
            transformedActivity.icon = Bell;
        }

        return transformedActivity;
      });

      setRecentActivities(activities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
      setActivitiesLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getDefaultImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
    ];
    return images[index % images.length];
  };

  const getDefaultUrgentNeed = (index) => {
    const needs = [
      "New Library Books",
      "Science Lab Equipment",
      "Computer Lab Upgrade",
      "Sports Equipment",
      "Art Supplies",
      "Scholarship Funds",
    ];
    return needs[index % needs.length];
  };

  const getDefaultCategory = (index) => {
    const categories = ["elementary", "high-school", "university"];
    return categories[index % categories.length];
  };

  const getRecentUpdate = (campaigns, schoolCreatedAt) => {
    const calculateDaysAgo = (date) => {
      return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    };

    let daysAgo;

    if (campaigns.length > 0) {
      const latestCampaign = campaigns.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];
      daysAgo = calculateDaysAgo(latestCampaign.created_at);
    } else {
      daysAgo = calculateDaysAgo(schoolCreatedAt);
    }

    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return `${daysAgo} days ago`;
  };

  const quickStats = [
    {
      label: "Total Donated",
      value: `${currentUser.totalDonated.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-gray-900",
    },
    {
      label: "Projects Supported",
      value: currentUser.projectsSupported,
      icon: Target,
      color: "text-gray-900",
    },
    {
      label: "Schools Helped",
      value: "0",
      icon: Building,
      color: "text-gray-900",
    },
    {
      label: "Impact Score",
      value: "None",
      icon: Award,
      color: "text-gray-900",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const handleDonate = (institutionId, campaignId = null) => {
    console.log("Donate to:", institutionId, "Campaign:", campaignId);
  };

  const handleViewSchool = (institutionId) => {
    navigate(`/school/${institutionId}`);
  };

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const filteredInstitutions = featuredInstitutions.filter((institution) => {
    const matchesCategory =
      selectedCategory === "all" || institution.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.urgentNeed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.recentUpdate) - new Date(a.recentUpdate);
      case "urgent":
        return b.totalNeeded - b.raised - (a.totalNeeded - a.raised);
      case "popular":
        return b.alumni - a.alumni;
      default:
        return 0;
    }
  });

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

      {/* Background Elements - Reduced on mobile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-gray-200/30 rounded-full blur-xl animate-pulse hidden md:block"
          style={parallaxOffset(0.3)}
        ></div>
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-gray-300/30 rounded-full blur-xl hidden md:block"
          style={{
            ...parallaxOffset(0.5),
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gray-200/30 rounded-full blur-xl hidden md:block"
          style={{
            ...parallaxOffset(0.4),
            animation: "float 8s ease-in-out infinite reverse",
          }}
        ></div>
      </div>

      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-xl shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section - Now visible on mobile too */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="h-6 w-6 text-gray-50" />
              </div>
              <div className="block sm:block">
                <span className="text-lg font-bold text-gray-900">
                  Alumni Portal
                </span>
                <div className="text-xs text-gray-600 font-medium">
                  Support & Give Back
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer" />
              </div>

              <div
                onClick={() => navigate("/alumni/profile")}
                className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <User className="w-8 h-8 text-gray-400 rounded-full border p-1" />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser.batch}
                  </div>
                </div>
                <Settings className="h-5 w-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 cursor-pointer h-10 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-red-100 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600 transition-colors" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-4">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-100 rounded-2xl">
              <User className="w-10 h-10 text-gray-400 rounded-full border p-1" />
              <div>
                <div className="font-semibold text-gray-800">
                  {currentUser.name}
                </div>
                <div className="text-sm text-gray-500">{currentUser.batch}</div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate("/alumni/profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <User className="h-5 w-5 text-gray-600" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate("#");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span>Notifications</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-3"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Welcome Section - Mobile Optimized */}
      <section
        className="pt-20 pb-8 px-4 sm:px-6 relative overflow-hidden"
        id="welcome"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible.welcome
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
              <div className="flex-1 w-full">
                {/* Welcome Badge */}
                <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 py-2 border border-gray-300 shadow-sm mb-4">
                  <Star className="h-4 w-4 text-gray-700" />
                  <span className="text-xs font-semibold text-gray-800">
                    Welcome back, {currentUser.name.split(" ")[0]}!
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900">
                  Your Impact
                  <br />
                  <span className="text-gray-800">Continues to Grow</span>
                </h1>

                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  Discover new opportunities to support educational institutions
                  and track the impact of your contributions.
                </p>

                {/* Quick Stats - Grid Layout for Mobile */}
                <div className="flex gap-3 mb-6 overflow-x-auto">
                  {quickStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div
                        key={index}
                        className="flex-shrink-0 w-36 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200 shadow-sm"
                      >
                        <IconComponent
                          className={`h-5 w-5 ${stat.color} mb-1`}
                        />
                        <div className="text-lg font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activities - Stack below on mobile */}
              <div className="w-full lg:w-96 flex flex-col">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm flex-1 flex flex-col">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Recent Activity
                  </h3>
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {activitiesLoading ? (
                      [1, 2, 3, 4].map((index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-2 rounded-xl bg-gray-100"
                        >
                          <div className="w-8 h-8 bg-gray-300 rounded-xl animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-300 rounded animate-pulse mb-1"></div>
                            <div className="h-2 bg-gray-300 rounded animate-pulse w-1/2"></div>
                          </div>
                        </div>
                      ))
                    ) : recentActivities.length === 0 ? (
                      <p className="text-gray-500 text-center text-sm py-3">
                        No recent activity
                      </p>
                    ) : (
                      recentActivities.slice(0, 2).map((activity, index) => {
                        const IconComponent = activity.icon;
                        return (
                          <div
                            key={activity.id || index}
                            className="flex items-center space-x-3 p-2 rounded-xl bg-gray-100"
                          >
                            <div className="w-8 h-8 bg-gray-800 rounded-xl flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-800 truncate">
                                {activity.type === "donation" &&
                                  `Donated ₹${activity.amount}`}
                                {activity.type === "milestone" &&
                                  activity.milestone}
                                {activity.type === "update" && activity.update}
                                {activity.type === "campaign_created" &&
                                  activity.action}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {activity.school} • {activity.date}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/alumni/activity")}
                    className="w-full mt-3 text-center text-gray-700 hover:text-gray-900 font-semibold text-xs transition-colors duration-300"
                  >
                    View All Activity →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section - Mobile Optimized */}
      <section
        className="py-8 bg-white/80 backdrop-blur-sm border-y border-gray-200 px-4 sm:px-6"
        id="search"
        data-animate
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible.search
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                Find <span className="text-gray-700">Schools to Support</span>
              </h2>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-sm">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-base rounded-2xl bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold flex items-center space-x-2"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent focus:outline-none text-gray-700 font-medium text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="elementary">Elementary</option>
                    <option value="high-school">High School</option>
                    <option value="university">University</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
                  <SortDesc className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent focus:outline-none text-gray-700 font-medium text-sm"
                  >
                    <option value="recent">Recently Updated</option>
                    <option value="urgent">Most Urgent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Institutions - Mobile Optimized */}
      <section
        id="institutions"
        className="py-8 bg-gray-100 px-4 sm:px-6"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto">
          <div
            className={`text-center mb-8 transform transition-all duration-1000 ${
              isVisible.institutions
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 py-2 border border-gray-300 shadow-sm mb-4">
              <Globe className="h-4 w-4 text-gray-700" />
              <span className="text-xs font-semibold text-gray-800">
                {sortedInstitutions.length} Schools Need Your Support
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Featured <span className="text-gray-800">Institutions</span>
            </h2>
          </div>

          {institutionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">
                  Loading institutions...
                </p>
              </div>
            </div>
          ) : institutionsError ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
                <p className="text-red-600 text-sm mb-3">{institutionsError}</p>
                <button
                  onClick={fetchFeaturedInstitutions}
                  className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : sortedInstitutions.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-200">
                <p className="text-gray-600 text-sm mb-3">
                  No institutions found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedInstitutions.map((institution, index) => (
                <div
                  key={institution.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={institution.image}
                      alt={institution.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2 py-1 border border-gray-300 shadow-sm">
                      <span className="text-xs font-bold text-gray-800">
                        Updated {institution.recentUpdate}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {institution.name}
                    </h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-xs font-medium">
                        {institution.location}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">
                      {institution.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          ₹{institution.raised.toLocaleString()} of ₹
                          {institution.totalNeeded.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gray-800 h-1.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${
                              institution.totalNeeded > 0
                                ? (institution.raised /
                                    institution.totalNeeded) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {institution.totalNeeded > 0
                          ? Math.round(
                              (institution.raised / institution.totalNeeded) *
                                100
                            )
                          : 0}
                        % funded
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs font-medium">
                          {institution.alumni} alumni
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {institution.needs} active needs
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDonate(institution.id)}
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold text-sm flex items-center justify-center space-x-1"
                      >
                        <Heart className="h-3 w-3" />
                        <span>Donate</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/alumni/institute-details/${institution.id}`
                          )
                        }
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-sm flex items-center justify-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedInstitutions.length > 6 && (
            <div className="text-center mt-8">
              <button className="bg-gray-800 text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold text-sm flex items-center space-x-2 mx-auto">
                <span>Load More</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

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
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default AlumniHomePage;
