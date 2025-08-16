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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const observerRef = useRef();
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [carouselSpeed] = useState(0.1); // Adjust speed here (lower is faster)

  // Enhanced mouse tracking for parallax effects
  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  // Intersection Observer for scroll animations
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

  // Auto testimonial rotation with pause on hover
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const featuredInstitutions = [
    {
      id: 1,
      name: "Bhaktivedanta Manor School",
      location: "Watford, UK",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 450,
    },
    {
      id: 2,
      name: "ISKCON Gurukula Vrindavan",
      location: "Vrindavan, India",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 5,
      alumni: 1200,
    },
    {
      id: 3,
      name: "New Mayapur Academy",
      location: "West Bengal, India",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 2,
      alumni: 320,
    },
    {
      id: 4,
      name: "Krishna Avanti Primary School",
      location: "London, UK",
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      needs: 4,
      alumni: 580,
    },
    {
      id: 5,
      name: "Radha Madhava Gurukula",
      location: "Belgium",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 320,
    },
    {
      id: 6,
      name: "Govardhan Academy",
      location: "Mumbai, India",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 2,
      alumni: 280,
    },
    {
      id: 7,
      name: "Gopal's Garden School",
      location: "Florida, USA",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 4,
      alumni: 380,
    },
  ];

  const testimonials = [
    {
      text: "Finding my old gurukula and contributing to their library project brought back so many beautiful memories. The transparency of seeing exactly how my donation was used was incredible.",
      author: "Radha Devi Dasi",
      batch: "Bhaktivedanta Manor '95",
      rating: 5,
    },
    {
      text: "This platform helped me reconnect with my gurukula family and support the next generation of devotees. Krishna consciousness education is so important.",
      author: "Govinda Das",
      batch: "Mayapur Academy '02",
      rating: 5,
    },
    {
      text: "As an institution admin, this platform made it so easy to showcase our needs and connect with our alumni worldwide. The support has been overwhelming.",
      author: "Jayadvaita Swami",
      batch: "Administrator, ISKCON Gurukula",
      rating: 5,
    },
  ];

  const stats = [
    { number: "50+", label: "ISKCON Institutions", icon: Building },
    { number: "5000+", label: "Alumni Connected", icon: Users },
    { number: "₹25L+", label: "Contributions Made", icon: Heart },
    { number: "30+", label: "Countries Reached", icon: Globe },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  // Parallax calculation
  const parallaxOffset = (strength = 0.5) => ({
    transform: `translate(${
      (mousePosition.x - window.innerWidth / 2) * strength * 0.01
    }px, ${(mousePosition.y - window.innerHeight / 2) * strength * 0.01}px)`,
  });

  // Infinite circular carousel animation
  useEffect(() => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const cards = carousel.querySelectorAll(".institution-card");
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 32; // px-8 = 32px gap
    const totalWidth = (cardWidth + gap) * cards.length;

    // Clone cards for seamless looping
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

      // Reset position when we've scrolled all original cards
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
  }, [carouselSpeed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-x-hidden">
      {/* Enhanced Floating Elements with Parallax */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-200/30 to-amber-200/30 rounded-full blur-xl animate-pulse"
          style={parallaxOffset(0.3)}
        ></div>
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.5),
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-r from-amber-200/30 to-yellow-200/30 rounded-full blur-xl"
          style={{
            ...parallaxOffset(0.4),
            animation: "float 8s ease-in-out infinite reverse",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-orange-300/20 to-yellow-300/20 rounded-full blur-lg"
          style={{
            ...parallaxOffset(0.6),
            animation: "float 7s ease-in-out infinite",
          }}
        ></div>
      </div>

      {/* Enhanced Navigation with Backdrop Blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                  <BookOpen className="h-7 w-7 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-2 w-2 text-white animate-spin" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  ISKCON Alumni
                </span>
                <div className="text-sm text-slate-500 font-medium">
                  Connect & Contribute
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {["How It Works", "Institutions", "About"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-slate-700 hover:text-orange-600 transition-all duration-300 font-medium relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-yellow-600 group-hover:w-full transition-all duration-500"></div>
                </a>
              ))}
              <button className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-8 py-3 rounded-2xl hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 font-semibold hover:scale-105 transform">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section with Staggered Animations */}
      <section
        className="pt-24 pb-32 relative overflow-hidden"
        id="hero"
        data-animate
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-yellow-50/60"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div
            className={`mb-8 transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 border border-orange-200/50 shadow-lg shadow-orange-500/10 hover:scale-105 transition-transform duration-300">
              <Shield className="h-5 w-5 text-orange-600 animate-pulse" />
              <span className="text-sm font-semibold text-orange-700">
                Trusted by 5000+ Alumni Worldwide
              </span>
            </div>
          </div>

          <h1
            className={`text-6xl md:text-7xl font-bold mb-8 leading-tight transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-500">
              Reconnect
            </span>
            <br />
            <span
              className="text-slate-800 inline-block"
              style={{ animationDelay: "600ms" }}
            >
              with Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-500 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-500">
              Spiritual Roots
            </span>
          </h1>

          <p
            className={`text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            Bridge the gap between ISKCON alumni and institutions. Support the
            spiritual education that shaped your Krishna consciousness journey
            with complete transparency and meaningful impact.
          </p>

          <div
            className={`max-w-3xl mx-auto mb-16 transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "1000ms" }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl shadow-orange-500/10 group-hover:shadow-orange-500/20 transition-all duration-500">
                <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6 group-hover:text-orange-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search your school, gurukula, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-20 pr-40 py-7 text-lg rounded-3xl bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-10 py-4 rounded-2xl hover:from-orange-600 hover:to-yellow-600 flex items-center space-x-3 transition-all duration-300 shadow-lg shadow-orange-500/25 font-semibold hover:scale-105"
                >
                  <span>Search</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-6 justify-center items-center transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "1200ms" }}
          >
            <button className="group bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-14 py-5 rounded-2xl text-lg font-semibold hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 flex items-center space-x-3 transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transform">
              <GraduationCap className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>I'm an Alumni</span>
            </button>
            <button className="group border-2 border-orange-200 bg-white/70 backdrop-blur-sm text-orange-700 px-14 py-5 rounded-2xl text-lg font-semibold hover:bg-orange-50 hover:border-orange-300 flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <Building className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span>I'm an Institution</span>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section with Counter Animation */}
      <section
        className="py-24 bg-white/80 backdrop-blur-sm border-y border-slate-200/50"
        id="stats"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const gradients = [
                "from-orange-500 to-amber-500",
                "from-yellow-500 to-orange-500",
                "from-amber-500 to-yellow-500",
                "from-orange-600 to-yellow-500",
              ];
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
                    className={`w-20 h-20 bg-gradient-to-br ${gradients[index]} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <IconComponent className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-4xl font-bold text-slate-800 mb-3 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works with Staggered Card Animations */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible["how-it-works"]
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full px-6 py-3 border border-orange-200/50 shadow-lg shadow-orange-500/10 mb-6 hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-orange-600 animate-spin" />
              <span className="text-sm font-semibold text-orange-700">
                Simple & Transparent Process
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
              How It{" "}
              <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Simple, transparent, and spiritual - connecting hearts across the
              ISKCON community with complete trust and accountability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Search,
                title: "Find Your Institution",
                description:
                  "Search for your gurukula, temple school, or any ISKCON educational institution you're connected with using our intelligent search.",
                gradient: "from-orange-500 to-amber-500",
              },
              {
                icon: Eye,
                title: "Explore Their Needs",
                description:
                  "Discover transparent funding needs with detailed photos, descriptions, and real-time progress tracking for complete accountability.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Heart,
                title: "Contribute & Connect",
                description:
                  "Make your contribution securely and stay connected with regular updates on how your support is making a meaningful difference.",
                gradient: "from-amber-500 to-yellow-500",
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
                <div className="relative mb-8">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <step.icon className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-100 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-bold text-orange-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-orange-700 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Infinite Circular Institutions Carousel */}
      <section
        id="institutions"
        className="py-24 bg-white/80 backdrop-blur-sm"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.institutions
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3 border border-yellow-200/50 shadow-lg shadow-yellow-500/10 mb-6 hover:scale-105 transition-transform duration-300">
              <Globe className="h-5 w-5 text-yellow-600 animate-pulse" />
              <span className="text-sm font-semibold text-yellow-700">
                Worldwide Network
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
              Featured{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Institutions
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Discover ISKCON institutions worldwide seeking alumni support
            </p>
          </div>

          {/* Infinite Circular Carousel */}
          <div className="relative overflow-hidden">
            <div ref={carouselRef} className="flex w-max gap-8 px-8">
              {featuredInstitutions.map((institution) => (
                <div
                  key={institution.id}
                  className="institution-card w-96 flex-shrink-0"
                >
                  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-500 border border-slate-200/50 hover:border-orange-200 transform">
                    <div className="relative overflow-hidden">
                      <img
                        src={institution.image}
                        alt={institution.name}
                        className="w-full h-56 object-cover transition-transform duration-700"
                        loading="lazy" // Add lazy loading
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent group-hover:from-slate-900/40 transition-all duration-500"></div>
                      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 border border-orange-200/50 shadow-lg animate-bounce">
                        <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                          {institution.needs} active needs
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-700 transition-colors duration-300">
                        {institution.name}
                      </h3>
                      <div className="flex items-center text-slate-600 mb-6">
                        <MapPin className="h-5 w-5 mr-3 text-yellow-500" />
                        <span className="font-medium">
                          {institution.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-600">
                          <Users className="h-5 w-5 mr-3 text-orange-500" />
                          <span className="font-medium">
                            {institution.alumni} alumni
                          </span>
                        </div>
                        <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-2xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg shadow-orange-500/25 font-semibold group-hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials with Smoother Transitions */}
      <section
        className="py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50"
        id="testimonials"
        data-animate
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`text-center mb-20 transform transition-all duration-1000 ${
              isVisible.testimonials
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-3 border border-amber-200/50 shadow-lg shadow-amber-500/10 mb-6 hover:scale-105 transition-transform duration-300">
              <Star className="h-5 w-5 text-amber-600 animate-pulse" />
              <span className="text-sm font-semibold text-amber-700">
                Community Stories
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-8">
              Community{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Voices
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Hear inspiring stories from our alumni and institutions
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div
              className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 p-10 md:p-16 text-center border border-slate-200/50 relative overflow-hidden transform transition-all duration-1000 ${
                isVisible.testimonials
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500"></div>

              {/* Animated Stars */}
              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-7 w-7 text-amber-400 fill-current mx-1 transform transition-all duration-300 hover:scale-125`}
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animation: "twinkle 2s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>

              {/* Testimonial Content with Fade Transition */}
              <div className="relative h-64 flex items-center justify-center">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${
                      index === currentTestimonial
                        ? "opacity-100 transform translate-x-0"
                        : index < currentTestimonial
                        ? "opacity-0 transform -translate-x-full"
                        : "opacity-0 transform translate-x-full"
                    }`}
                  >
                    <blockquote className="text-2xl md:text-3xl text-slate-700 mb-10 leading-relaxed font-medium">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="border-t border-slate-200 pt-8">
                      <div className="font-bold text-xl text-slate-800 mb-2">
                        {testimonial.author}
                      </div>
                      <div className="text-slate-600 font-medium">
                        {testimonial.batch}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Testimonial Controls */}
            <div className="flex justify-center mt-10 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial
                      ? "bg-gradient-to-r from-orange-500 to-yellow-500 scale-125 shadow-lg"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Pulse Animation */}
      <section
        className="py-24 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 relative overflow-hidden"
        id="cta"
        data-animate
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-yellow-900/20"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/2 right-20 w-32 h-32 bg-white/5 rounded-full"
            style={{ animation: "float 8s ease-in-out infinite" }}
          ></div>
          <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        <div
          className={`max-w-6xl mx-auto px-6 text-center relative z-10 transform transition-all duration-1000 ${
            isVisible.cta
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 hover:scale-105 transition-transform duration-500">
            Ready to Make a <span className="text-yellow-200">Difference</span>?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of ISKCON alumni supporting spiritual education
            worldwide. Every contribution counts in spreading Krishna
            consciousness and nurturing future generations.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group bg-white text-orange-700 px-14 py-5 rounded-2xl text-lg font-semibold hover:bg-yellow-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 flex items-center space-x-3 transform">
              <Heart className="h-6 w-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300" />
              <span>Start Contributing Today</span>
            </button>
            <button className="group border-2 border-white text-white px-14 py-5 rounded-2xl text-lg font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 flex items-center space-x-3">
              <Building className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span>List Your Institution</span>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer with Hover Effects */}
      <footer className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="group">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">ISKCON Alumni</span>
                  <div className="text-sm text-slate-400">Connect</div>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                Connecting hearts and supporting spiritual education across the
                global ISKCON community with transparency and trust.
              </p>
            </div>

            <div className="group">
              <h3 className="text-lg font-semibold mb-6 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
                For Alumni
              </h3>
              <ul className="space-y-3 text-slate-400">
                {[
                  "Find Your School",
                  "Browse Needs",
                  "Make Contribution",
                  "Track Impact",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-all duration-300 hover:text-yellow-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-lg font-semibold mb-6 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
                For Institutions
              </h3>
              <ul className="space-y-3 text-slate-400">
                {[
                  "Register Institution",
                  "Post Your Needs",
                  "Connect with Alumni",
                  "Transparency Tools",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-all duration-300 hover:text-yellow-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-lg font-semibold mb-6 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
                Support
              </h3>
              <ul className="space-y-3 text-slate-400">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-all duration-300 hover:text-yellow-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-16 pt-10 text-center text-slate-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="mb-4 md:mb-0 hover:text-slate-300 transition-colors duration-300">
                &copy; 2025 ISKCON Alumni Connect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
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
