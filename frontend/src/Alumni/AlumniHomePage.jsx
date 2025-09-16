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
  LogOut,
  BookOpen,
  Shield,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AlumniHomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const observerRef = useRef();
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [carouselSpeed] = useState(0.1);
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
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get("http://localhost:4000/api/users/me", {
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
        totalDonated: 2500,
        projectsSupported: 8,
        avatar: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  const featuredInstitutions = [
    {
      id: 1,
      name: "Stanford Elementary School",
      location: "California, USA",
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 450,
      totalNeeded: 15000,
      raised: 8500,
      urgentNeed: "New Library Books",
      urgentAmount: 3500,
      category: "elementary",
      recentUpdate: "2 days ago",
      description:
        "Supporting young minds with quality education and resources for the future leaders of tomorrow.",
    },
    {
      id: 2,
      name: "Cambridge International School",
      location: "London, UK",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 5,
      alumni: 1200,
      totalNeeded: 25000,
      raised: 18700,
      urgentNeed: "Science Lab Equipment",
      urgentAmount: 6300,
      category: "high-school",
      recentUpdate: "1 day ago",
      description:
        "Fostering global citizens with comprehensive education and modern learning facilities.",
    },
    {
      id: 3,
      name: "Delhi Public School",
      location: "New Delhi, India",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 2,
      alumni: 320,
      totalNeeded: 12000,
      raised: 9200,
      urgentNeed: "Computer Lab Upgrade",
      urgentAmount: 2800,
      category: "high-school",
      recentUpdate: "3 days ago",
      description:
        "Empowering students with technology and knowledge to excel in the digital age.",
    },
    {
      id: 4,
      name: "Melbourne Grammar School",
      location: "Melbourne, Australia",
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      needs: 4,
      alumni: 580,
      totalNeeded: 30000,
      raised: 12400,
      urgentNeed: "Sports Equipment",
      urgentAmount: 4500,
      category: "university",
      recentUpdate: "5 hours ago",
      description:
        "Building character and academic excellence through holistic education and community support.",
    },
    {
      id: 5,
      name: "International School Brussels",
      location: "Brussels, Belgium",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 320,
      totalNeeded: 18000,
      raised: 11200,
      urgentNeed: "Art Supplies",
      urgentAmount: 2200,
      category: "high-school",
      recentUpdate: "1 week ago",
      description:
        "Nurturing creativity and international mindedness in our diverse student community.",
    },
  ];

  const recentActivities = [
    {
      type: "donation",
      school: "Stanford Elementary School",
      amount: 500,
      project: "New Library Books",
      date: "2 days ago",
      icon: Heart,
    },
    {
      type: "milestone",
      school: "Cambridge International",
      project: "Science Lab Equipment",
      milestone: "75% funded",
      date: "1 week ago",
      icon: Target,
    },
    {
      type: "update",
      school: "Delhi Public School",
      update: "Computer lab construction started!",
      date: "2 weeks ago",
      icon: TrendingUp,
    },
  ];

  const quickStats = [
    {
      label: "Total Donated",
      value: `$${currentUser.totalDonated.toLocaleString()}`,
      icon: DollarSign,
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
      value: "3",
      icon: Building,
      color: "text-gray-900",
    },
    {
      label: "Impact Score",
      value: "Gold",
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
      institution.location.toLowerCase().includes(searchQuery.toLowerCase());
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
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-md">
                  <GraduationCap className="h-7 w-7 text-gray-50 transform transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  Alumni Connect
                </span>
                <div className="text-sm text-gray-600 font-medium">
                  Support & Give Back
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
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
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <section
        className="pt-24 pb-12 relative overflow-hidden"
        id="welcome"
        data-animate
      >
        <div className="max-w-screen-2xl mx-auto px-10">
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
                    Welcome back, {currentUser.name.split(" ")[0]}!{" "}
                    {/* Fixed this line */}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900">
                  Your Impact
                  <br />
                  <span className="text-gray-800">Continues to Grow</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Discover new opportunities to support educational institutions
                  and track the impact of your contributions across the globe.
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
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                        >
                          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">
                              {activity.type === "donation" &&
                                `Donated $${activity.amount}`}
                              {activity.type === "milestone" &&
                                activity.milestone}
                              {activity.type === "update" && "New Update"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {activity.school} • {activity.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="w-full mt-4 text-center text-gray-700 hover:text-gray-900 font-semibold text-sm transition-colors duration-300">
                    View All Activity →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section
        className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-200"
        id="search"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`transform transition-all duration-1000 ${
              isVisible.search
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Find <span className="text-gray-700">Schools to Support</span>
              </h2>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gray-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-500">
                  <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-hover:text-gray-600 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search schools, colleges, or universities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-20 pr-40 py-6 text-lg rounded-3xl bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 transition-all duration-300"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-8 py-3 rounded-2xl hover:bg-gray-700 flex items-center space-x-3 transition-all duration-300 shadow-sm font-semibold hover:scale-105"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-sm">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent focus:outline-none text-gray-700 font-medium"
                  >
                    <option value="all">All Categories</option>
                    <option value="elementary">Elementary</option>
                    <option value="high-school">High School</option>
                    <option value="university">University</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200 shadow-sm">
                  <SortDesc className="h-5 w-5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent focus:outline-none text-gray-700 font-medium"
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

      {/* Featured Institutions */}
      <section id="institutions" className="py-16 bg-gray-100" data-animate>
        <div className="max-w-screen-2xl mx-auto px-10">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 ${
              isVisible.institutions
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-6 py-3 border border-gray-300 shadow-sm mb-6 hover:scale-105 transition-transform duration-300">
              <Globe className="h-5 w-5 text-gray-700 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800">
                {sortedInstitutions.length} Schools Need Your Support
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-gray-800">Institutions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedInstitutions.map((institution, index) => (
              <div
                key={institution.id}
                className={`group bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300 transform hover:scale-105 ${
                  isVisible.institutions
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={institution.image}
                    alt={institution.name}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent group-hover:from-gray-900/40 transition-all duration-500"></div>

                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1 border border-gray-300 shadow-sm">
                    <span className="text-xs font-bold text-gray-800">
                      Updated {institution.recentUpdate}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-sm">
                      <div className="text-xs text-gray-600 mb-1">
                        Urgent Need
                      </div>
                      <div className="text-sm font-bold text-gray-800">
                        {institution.urgentNeed}
                      </div>
                      <div className="text-xs text-gray-700 font-semibold">
                        ${institution.urgentAmount.toLocaleString()} needed
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                    {institution.name}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      {institution.location}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {institution.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        ${institution.raised.toLocaleString()} of $
                        {institution.totalNeeded.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-800 h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${
                            (institution.raised / institution.totalNeeded) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (institution.raised / institution.totalNeeded) * 100
                      )}
                      % funded
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">
                        {institution.alumni} alumni
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {institution.needs} active needs
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold hover:scale-105 flex items-center justify-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>Donate</span>
                    </button>
                    <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold hover:scale-105 flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedInstitutions.length > 6 && (
            <div className="text-center mt-12">
              <button className="bg-gray-800 text-white px-12 py-4 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md font-semibold hover:scale-105 flex items-center space-x-3 mx-auto">
                <span>Load More Schools</span>
                <ChevronRight className="h-5 w-5" />
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
      `}</style>
    </div>
  );
};

export default AlumniHomePage;
