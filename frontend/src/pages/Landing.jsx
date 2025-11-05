import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  MapPin,
  Users,
  Building,
  Star,
  Globe,
  GraduationCap,
  Eye,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for real data
  const [featuredInstitutions, setFeaturedInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const observerRef = useRef();
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [carouselSpeed] = useState(0.1);
  const navigate = useNavigate();

  // Fetch featured schools from backend
  useEffect(() => {
    const fetchFeaturedSchools = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/schools`);

        if (response.data.schools) {
          // Transform the backend data to match your frontend structure
          const transformedSchools = response.data.schools.map(
            (school, index) => ({
              id: school.id,
              name: school.name,
              location:
                `${school.city || ""}${
                  school.city && school.state ? ", " : ""
                }${school.state || ""}`.trim() || "Location not specified",
              image: school.logo_url || getDefaultImage(index),
              needs: getRandomNeeds(),
              alumni:
                school.alumni_count && school.alumni_count > 0
                  ? school.alumni_count
                  : 0,
            })
          );

          setFeaturedInstitutions(transformedSchools);
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Failed to load featured schools");
        // Fallback to static data if API fails
        setFeaturedInstitutions(getFallbackInstitutions());
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedSchools();
  }, []);

  // Helper functions
  const getDefaultImage = (index) => {
    const defaultImages = [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
    ];
    return defaultImages[index % defaultImages.length];
  };

  const getRandomNeeds = () => Math.floor(Math.random() * 5) + 1;

  const getFallbackInstitutions = () => [
    {
      id: 1,
      name: "Stanford Elementary School",
      location: "California, USA",
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 450,
    },
    {
      id: 2,
      name: "Cambridge International School",
      location: "London, UK",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 5,
      alumni: 1200,
    },
    {
      id: 3,
      name: "Delhi Public School",
      location: "New Delhi, India",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 2,
      alumni: 320,
    },
  ];

  const testimonials = [
    {
      text: "Finding my old school and contributing to their new library project brought back so many wonderful memories. The transparency of seeing exactly how my donation was used was incredible.",
      author: "Sarah Johnson",
      batch: "Stanford Elementary '95",
      rating: 5,
    },
    {
      text: "This platform helped me reconnect with my alma mater and support the next generation of students. Education is the foundation of everything.",
      author: "Michael Chen",
      batch: "Cambridge International '02",
      rating: 5,
    },
    {
      text: "As a school administrator, this platform made it so easy to showcase our needs and connect with our alumni worldwide. The support has been overwhelming.",
      author: "Dr. Patricia Williams",
      batch: "Principal, Melbourne Grammar",
      rating: 5,
    },
  ];

  const stats = [
    { number: "100+", label: "Schools Connected", icon: Building },
    { number: "1000+", label: "Alumni Registered", icon: Users },
    { number: "₹25,000+", label: "Funds Raised", icon: Heart },
    { number: "10+", label: "Countries Reached", icon: Globe },
  ];

  // Existing useEffect hooks
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
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  useEffect(() => {
    if (!carouselRef.current || featuredInstitutions.length === 0) return;

    const carousel = carouselRef.current;
    const cards = carousel.querySelectorAll(".institution-card");
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 32;
    const totalWidth = (cardWidth + gap) * cards.length;

    // Clear existing clones
    const existingClones = carousel.querySelectorAll(".clone");
    existingClones.forEach((clone) => clone.remove());

    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("clone");
      carousel.appendChild(clone);
    });

    let position = 0;
    let lastTimestamp = 0;

    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      position -= delta * carouselSpeed;

      if (position <= -totalWidth) {
        position = 0;
      }

      carousel.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [carouselSpeed, featuredInstitutions]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Alumni Connect
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-4">
            {["How It Works", "Schools", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={handleNavClick}
                className="block py-3 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium"
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => {
                handleNavClick();
                navigate("/auth");
              }}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold cursor-pointer mt-4"
            >
              Sign In
            </button>
          </nav>
        </div>
      </div>

      {/* Background Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-50/95 backdrop-blur-xl shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            <div className="flex items-center space-x-3 lg:space-x-4 group">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-md">
                  <GraduationCap className="h-5 w-5 lg:h-7 lg:w-7 text-gray-50 transform transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold text-gray-900">
                  Alumni Connect
                </span>
                <div className="text-xs lg:text-sm text-gray-600 font-medium hidden sm:block">
                  Support & Give Back
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {["How It Works", "Schools", "About"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 group-hover:w-full transition-all duration-500"></div>
                </a>
              ))}
              <button
                onClick={() => navigate("/auth")}
                className="bg-gray-900 text-gray-50 px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="pt-20 lg:pt-24 pb-16 lg:pb-32 relative overflow-hidden"
        id="hero"
        data-animate
      >
        <div className="absolute inset-0 bg-gray-100/60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lg:mb-8 leading-tight transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          >
            <span className="text-gray-800 inline-block hover:scale-105 transition-transform duration-500">
              Stronger
            </span>
            <br />
            <span
              className="text-gray-700 inline-block"
              style={{ animationDelay: "50ms" }}
            >
              Together,
            </span>
            <br />
            <span className="text-gray-900 inline-block hover:scale-105 transition-transform duration-500">
              Beyond Campus
            </span>
          </h1>
          <p
            className={`text-base sm:text-lg lg:text-xl text-gray-600 mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-4 transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          >
            Bridge the gap between alumni and educational institutions
            worldwide. Support the schools that shaped your journey with
            complete transparency.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          >
            <button
              onClick={() => navigate("/auth/signup/alumni")}
              className="w-full sm:w-auto bg-gray-900 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg lg:rounded-xl text-base font-semibold hover:bg-gray-800 flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <GraduationCap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>I'm an Alumni</span>
            </button>
            <button
              onClick={() => navigate("/auth/signup/institution")}
              className="w-full sm:w-auto border border-gray-300 bg-white text-gray-800 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg lg:rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Building className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>I'm an Institution</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-12 lg:py-20 bg-white border-y border-gray-200"
        id="stats"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`text-center group transform transition-all duration-1000 ${
                    isVisible.stats
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div
                    className={`w-12 h-12 lg:w-16 lg:h-16 bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-gray-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xs lg:text-base text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 lg:py-20 bg-gray-100"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 lg:mb-16 transform transition-all duration-1000 ${
              isVisible["how-it-works"]
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 shadow-sm mb-4 lg:mb-6">
              <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700 animate-spin" />
              <span className="text-xs lg:text-sm font-semibold text-gray-800">
                Simple & Transparent Process
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 lg:mb-8">
              How It <span className="text-gray-800">Works</span>
            </h2>
            <p className="text-sm lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Simple, transparent, and impactful - connecting alumni with their
              schools through complete trust and accountability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: Search,
                title: "Find Your School",
                description:
                  "Search for your elementary school, high school, college, or university using our comprehensive database of educational institutions worldwide.",
              },
              {
                icon: Eye,
                title: "Explore Their Needs",
                description:
                  "Discover transparent funding requests with detailed project descriptions, photos, and real-time progress tracking for complete accountability.",
              },
              {
                icon: Heart,
                title: "Contribute & Connect",
                description:
                  "Make secure contributions and stay connected with regular updates showing exactly how your support is making a meaningful difference.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`text-center group transform transition-all duration-1000 ${
                  isVisible["how-it-works"]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
                style={{ transitionDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="relative mb-6 lg:mb-8">
                  <div
                    className={`w-16 h-16 lg:w-20 lg:h-20 bg-gray-800 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <step.icon className="h-8 w-8 lg:h-10 lg:w-10 text-gray-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 lg:w-7 lg:h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xs lg:text-sm font-bold text-gray-800">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-gray-800 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section id="schools" className="py-16 lg:py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 lg:mb-16 transform transition-all duration-1000 ${
              isVisible.schools
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-4 lg:px-6 py-2 lg:py-3 border border-gray-300 shadow-sm mb-4 lg:mb-6">
              <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-gray-700 animate-pulse" />
              <span className="text-xs lg:text-sm font-semibold text-gray-800">
                Global Network
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-6 lg:mb-8">
              Featured <span className="text-gray-800">Schools</span>
            </h2>
            <p className="text-sm lg:text-lg text-gray-600 px-4">
              Discover educational institutions worldwide seeking alumni support
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured schools...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-gray-600">Showing demo schools instead</p>
            </div>
          )}

          {/* Mobile Cards Stack */}
          <div className="block lg:hidden space-y-6 px-4">
            {featuredInstitutions.slice(0, 3).map((institution) => (
              <div
                key={institution.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={institution.image}
                    alt={institution.name}
                    className="w-full h-40 object-cover transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 group-hover:from-gray-900/40 transition-all duration-500"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {institution.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-sm font-medium">
                      {institution.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">
                        {institution.alumni > 0
                          ? `${institution.alumni} alumni`
                          : "No alumni registered yet"}
                      </span>
                    </div>
                    <button
                      className="bg-gray-800 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold cursor-pointer"
                      onClick={() => navigate("/auth")}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Carousel */}
          <div className="hidden lg:block relative overflow-hidden">
            {featuredInstitutions.length > 0 ? (
              <div ref={carouselRef} className="flex w-max gap-6 px-6">
                {featuredInstitutions.map((institution) => (
                  <div
                    key={institution.id}
                    className="institution-card w-80 flex-shrink-0"
                  >
                    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300 min-h-[420px] flex flex-col">
                      <div className="relative overflow-hidden">
                        <img
                          src={institution.image}
                          alt={institution.name}
                          className="w-full h-48 object-cover transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 group-hover:from-gray-900/40 transition-all duration-500"></div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300 line-clamp-2">
                          {institution.name}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-5">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">
                            {institution.location}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {institution.alumni > 0
                                ? `${institution.alumni} alumni`
                                : "No alumni registered yet"}
                            </span>
                          </div>
                          <button
                            className="bg-gray-800 text-white px-5 cursor-pointer py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold"
                            onClick={() => navigate("/auth")}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No schools found</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 lg:py-20 bg-gray-900 relative overflow-hidden"
        id="cta"
        data-animate
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/20"></div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-16 h-16 bg-gray-700/20 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/2 right-16 w-24 h-24 bg-gray-700/10 rounded-full"
            style={{ animation: "float 8s ease-in-out infinite" }}
          ></div>
          <div className="absolute bottom-16 left-1/3 w-12 h-12 bg-gray-700/20 rounded-full animate-bounce"></div>
        </div>

        <div
          className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transform transition-all duration-1000 ${
            isVisible.cta
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-50 mb-6 lg:mb-8">
            Ready to Make a <span className="text-gray-300">Difference</span>?
          </h2>
          <p className="text-sm lg:text-lg text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed px-4">
            Join thousands of alumni supporting education worldwide. Every
            contribution counts in shaping the future of students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/auth/signup/alumni")}
              className="bg-white text-gray-900 px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              Join as Alumni
            </button>
            <button
              onClick={() => navigate("/auth/signup/institution")}
              className="border border-gray-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 cursor-pointer"
            >
              Register School
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-50 py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="group">
              <div className="flex items-center space-x-3 mb-6 lg:mb-8">
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gray-50 rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-gray-900" />
                </div>
                <div>
                  <span className="text-lg font-bold">Alumni Connect</span>
                  <div className="text-xs lg:text-sm text-gray-400">
                    Support & Give Back
                  </div>
                </div>
              </div>
              <p className="text-sm lg:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Connecting graduates with their educational institutions
                worldwide, fostering support and creating lasting impact.
              </p>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-4 lg:mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                For Alumni
              </h3>
              <ul className="space-y-2 lg:space-y-3 text-gray-400">
                {[
                  "Find Your School",
                  "Browse Projects",
                  "Make Donation",
                  "Track Impact",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm lg:text-base hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-4 lg:mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                For Schools
              </h3>
              <ul className="space-y-2 lg:space-y-3 text-gray-400">
                {[
                  "Register School",
                  "Create Projects",
                  "Connect with Alumni",
                  "Track Donations",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm lg:text-base hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-4 lg:mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                Support
              </h3>
              <ul className="space-y-2 lg:space-y-3 text-gray-400">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm lg:text-base hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 lg:mt-12 pt-6 lg:pt-8 text-center text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm lg:text-base mb-4 md:mb-0 hover:text-gray-300 transition-colors duration-300">
                &copy; 2025 Alumni Connect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

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

        @keyframes twinkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
