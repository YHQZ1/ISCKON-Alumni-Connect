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
  Sparkles,
  BookOpen,
  Shield,
  LogOut,
  User,
  Bell,
  Settings,
  History,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Award,
  ChevronRight,
  Filter,
  SortDesc,
  Plus,
  Edit,
  BarChart3,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstituteHomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const observerRef = useRef();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("needs");

  // Mock institution data
  const currentInstitution = {
    name: "Stanford Elementary School",
    location: "California, USA",
    type: "Elementary School",
    established: 1985,
    totalStudents: 450,
    alumniCount: 3200,
    description:
      "Supporting young minds with quality education and resources for the future leaders of tomorrow.",
    logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
    totalRaised: 18500,
    activeNeeds: 3,
    completedProjects: 12,
  };

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
    };
  }, []);

  const fundingNeeds = [
    {
      id: 1,
      title: "New Library Books",
      description:
        "Update our library with new educational books and reading materials for all grade levels.",
      goalAmount: 5000,
      raisedAmount: 3200,
      donors: 47,
      status: "active",
      category: "Learning Resources",
      dateCreated: "2023-10-15",
      urgency: "high",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
    },
    {
      id: 2,
      title: "Science Lab Equipment",
      description:
        "Modern microscopes, chemistry sets, and biology specimens for hands-on learning.",
      goalAmount: 7500,
      raisedAmount: 4200,
      donors: 32,
      status: "active",
      category: "STEM",
      dateCreated: "2023-11-05",
      urgency: "medium",
      image:
        "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "Playground Renovation",
      description:
        "Safe, modern play equipment for our students' physical development and recreation.",
      goalAmount: 12000,
      raisedAmount: 8500,
      donors: 68,
      status: "active",
      category: "Facilities",
      dateCreated: "2023-09-20",
      urgency: "medium",
      image:
        "https://images.unsplash.com/photo-1546593064-053d21199be1?w=400&h=250&fit=crop",
    },
    {
      id: 4,
      title: "Computer Lab Upgrade",
      description:
        "New computers and software for our technology education program.",
      goalAmount: 15000,
      raisedAmount: 15000,
      donors: 92,
      status: "completed",
      category: "Technology",
      dateCreated: "2023-06-10",
      dateCompleted: "2023-09-15",
      image:
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&h=250&fit=crop",
    },
  ];

  const recentDonations = [
    {
      donor: "Michael Chen",
      amount: 500,
      project: "New Library Books",
      date: "2 hours ago",
      anonymous: false,
    },
    {
      donor: "Anonymous",
      amount: 250,
      project: "Science Lab Equipment",
      date: "5 hours ago",
      anonymous: true,
    },
    {
      donor: "Sarah Johnson",
      amount: 1000,
      project: "Playground Renovation",
      date: "1 day ago",
      anonymous: false,
    },
    {
      donor: "Robert Williams",
      amount: 300,
      project: "New Library Books",
      date: "2 days ago",
      anonymous: false,
    },
  ];

  const quickStats = [
    {
      label: "Total Raised",
      value: `$${currentInstitution.totalRaised.toLocaleString()}`,
      icon: DollarSign,
      color: "text-gray-900",
    },
    {
      label: "Active Needs",
      value: currentInstitution.activeNeeds,
      icon: Target,
      color: "text-gray-900",
    },
    {
      label: "Completed Projects",
      value: currentInstitution.completedProjects,
      icon: CheckCircle,
      color: "text-gray-900",
    },
    {
      label: "Total Donors",
      value: "247",
      icon: Users,
      color: "text-gray-900",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex justify-between items-center h-18">
            {/* Left - Branding */}
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-md">
                  <Building className="h-7 w-7 text-gray-50 transform transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  Institution Portal
                </span>
                <div className="text-sm text-gray-600 font-medium">
                  Manage Your School's Needs
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer" />
              </div>

              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <img
                  src={currentInstitution.logo}
                  alt={currentInstitution.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {currentInstitution.name}
                  </div>
                  <div className="text-xs text-gray-500">Admin Portal</div>
                </div>
                <Settings className="h-5 w-5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer" />
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 cursor-pointer h-10 rounded-2xl bg-white/50 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-md hover:bg-red-100 transition-all duration-300"
              >
                <LogOut className="h-5 w-5 text-gray-600 hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <section
        className="pt-24 pb-12 relative overflow-hidden"
        id="welcome"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto px-0">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible.welcome
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-6 py-3 border border-gray-300 shadow-sm mb-6 hover:scale-105 transition-transform duration-300">
                  <Star className="h-5 w-5 text-gray-700 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-800">
                    Institution Admin Dashboard
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                  {currentInstitution.name}
                  <br />
                  <span className="text-gray-800">Fundraising Management</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {currentInstitution.description}
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <IconComponent
                          className={`h-6 w-6 ${stat.color} mb-2`}
                        />
                        <div className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 lg:flex-none">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {donation.anonymous ? "Anonymous" : donation.donor}
                          </div>
                          <div className="text-xs text-gray-600">
                            {donation.project}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-800">
                            ${donation.amount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-gray-700 hover:text-gray-900 font-semibold text-sm transition-colors duration-300">
                    View All Donations →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section
        className="py-8 bg-white/80 backdrop-blur-sm border-y border-gray-200"
        id="tabs"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex space-x-8">
            <button
              className={`px-4 py-2 text-lg cursor-pointer font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "needs"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("needs")}
            >
              Funding Needs
            </button>
            <button
              className={`px-4 py-2 text-lg font-semibold cursor-pointer rounded-xl transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Institution Profile
            </button>
            <button
              className={`px-4 py-2 text-lg cursor-pointer font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "analytics"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="content" className="py-12 bg-gray-100" data-animate>
        <div className="max-w-screen-2xl mx-auto px-10">
          {activeTab === "needs" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Funding <span className="text-gray-800">Needs</span>
                </h2>
                <button className="bg-gray-800 text-white cursor-pointer px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Need</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {fundingNeeds.map((need, index) => (
                  <div
                    key={need.id}
                    className={`group bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] ${
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
                        className="w-full h-48 object-cover transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent group-hover:from-gray-900/40 transition-all duration-500"></div>

                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1 border border-gray-300 shadow-sm">
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

                      {need.urgency === "high" && need.status === "active" && (
                        <div className="absolute top-4 left-4 bg-red-500/95 backdrop-blur-sm rounded-2xl px-3 py-1 border border-red-200/50 shadow-sm">
                          <span className="text-xs font-bold text-white flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            URGENT
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                        {need.title}
                      </h3>

                      <div className="flex items-center text-gray-600 mb-3">
                        <Tag className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">
                          {need.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {need.description}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>
                            ${need.raisedAmount.toLocaleString()} of $
                            {need.goalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${
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

                      <div className="flex gap-3">
                        <button className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center justify-center space-x-2">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Institution <span className="text-gray-800">Profile</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.name}
                      readOnly
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.location}
                      readOnly
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Type
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.type}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Established
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.established}
                      readOnly
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Students
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.totalStudents}
                      readOnly
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alumni Count
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={currentInstitution.alumniCount.toLocaleString()}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent h-32"
                  value={currentInstitution.description}
                  readOnly
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Logo
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={currentInstitution.logo}
                    alt="Institution Logo"
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
                  />
                  <button className="bg-gray-800 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload New Logo</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-gray-800 text-white px-8 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Fundraising <span className="text-gray-800">Analytics</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    $18,500
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Total Raised
                  </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    247
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Total Donors
                  </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    68%
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Average Completion
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Donations Over Time
                </h3>
                <div className="bg-gray-100 rounded-2xl p-6 h-64 flex items-center justify-center">
                  <div className="text-gray-400">
                    Chart visualization would appear here
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Top Funding Needs
                  </h3>
                  <div className="space-y-4">
                    {fundingNeeds
                      .filter((need) => need.status === "active")
                      .map((need, index) => (
                        <div
                          key={need.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {need.title}
                          </div>
                          <div className="text-sm font-bold text-gray-700">
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Recent Donor Activity
                  </h3>
                  <div className="space-y-4">
                    {recentDonations.map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {donation.anonymous ? "Anonymous" : donation.donor}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.project}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-800">
                          ${donation.amount}
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

// Helper component for tag icon
const Tag = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

export default InstituteHomePage;
