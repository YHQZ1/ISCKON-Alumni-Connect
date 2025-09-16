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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const observerRef = useRef();
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [carouselSpeed] = useState(0.1);
  const navigate = useNavigate();

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

  const featuredInstitutions = [
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
    {
      id: 4,
      name: "Melbourne Grammar School",
      location: "Melbourne, Australia",
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
      needs: 4,
      alumni: 580,
    },
    {
      id: 5,
      name: "International School Brussels",
      location: "Brussels, Belgium",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 3,
      alumni: 320,
    },
    {
      id: 6,
      name: "Mumbai International Academy",
      location: "Mumbai, India",
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=250&fit=crop",
      needs: 2,
      alumni: 280,
    },
    {
      id: 7,
      name: "Riverside Preparatory School",
      location: "Florida, USA",
      image:
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop",
      needs: 4,
      alumni: 380,
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
    { number: "500+", label: "Schools Connected", icon: Building },
    { number: "25,000+", label: "Alumni Registered", icon: Users },
    { number: "$2.5M+", label: "Funds Raised", icon: Heart },
    { number: "50+", label: "Countries Reached", icon: Globe },
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

  useEffect(() => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const cards = carousel.querySelectorAll(".institution-card");
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 32;
    const totalWidth = (cardWidth + gap) * cards.length;

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
  }, [carouselSpeed]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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
        <div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gray-300/20 rounded-full blur-lg"
          style={{
            ...parallaxOffset(0.6),
            animation: "float 7s ease-in-out infinite",
          }}
        ></div>
      </div>

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
            <div className="hidden md:flex items-center space-x-8">
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
                className="bg-gray-900 text-gray-50 px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section
        className="pt-24 pb-32 relative overflow-hidden"
        id="hero"
        data-animate
      >
        <div className="absolute inset-0 bg-gray-100/60"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div
            className={`mb-8 transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          ></div>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-8 leading-tight transform transition-all duration-1000 ${
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
            className={`text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          >
            Bridge the gap between alumni and educational institutions
            worldwide. Support the schools that shaped your journey with
            complete transparency and meaningful impact. Give back to education
            that matters.
          </p>
          <div
            className={`max-w-3xl mx-auto mb-6 transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          ></div>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 ${
              isVisible.hero
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: "50ms" }}
          >
            <button
              onClick={() => navigate("/auth/signup/alumni")}
              className="group bg-gray-900 text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 flex items-center space-x-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <GraduationCap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>I'm an Alumni</span>
            </button>
            <button
              onClick={() => navigate("/auth/signup/institution")}
              className="group border border-gray-300 bg-white text-gray-800 px-10 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 flex items-center space-x-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Building className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>I'm an Institution</span>
            </button>
          </div>
        </div>
      </section>

      <section
        className="py-20 bg-white border-y border-gray-200"
        id="stats"
        data-animate
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                    className={`w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <IconComponent className="h-8 w-8 text-gray-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-3 group-hover:scale-105 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-gray-100" data-animate>
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible["how-it-works"]
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-6 py-3 border border-gray-300 shadow-sm mb-6">
              <Sparkles className="h-5 w-5 text-gray-700 animate-spin" />
              <span className="text-sm font-semibold text-gray-800">
                Simple & Transparent Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              How It <span className="text-gray-800">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and impactful - connecting alumni with their
              schools through complete trust and accountability in educational
              giving
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
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
                <div className="relative mb-8">
                  <div
                    className={`w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <step.icon className="h-10 w-10 text-gray-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-bold text-gray-800">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="schools" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible.schools
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-6 py-3 border border-gray-300 shadow-sm mb-6">
              <Globe className="h-5 w-5 text-gray-700 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800">
                Global Network
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Featured <span className="text-gray-800">Schools</span>
            </h2>
            <p className="text-lg text-gray-600">
              Discover educational institutions worldwide seeking alumni support
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div ref={carouselRef} className="flex w-max gap-6 px-6">
              {featuredInstitutions.map((institution) => (
                <div
                  key={institution.id}
                  className="institution-card w-80 flex-shrink-0"
                >
                  <div className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 border border-gray-200 hover:border-gray-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={institution.image}
                        alt={institution.name}
                        className="w-full h-48 object-cover transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent group-hover:from-gray-900/40 transition-all duration-500"></div>
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 border border-gray-300 shadow-sm">
                        <span className="text-sm font-bold text-gray-800">
                          {institution.needs} active needs
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                        {institution.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-5">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">
                          {institution.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium">
                            {institution.alumni} alumni
                          </span>
                        </div>
                        <button className="bg-gray-800 text-white px-5 cursor-pointer py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-sm font-semibold">
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

      <section
        className="py-20 bg-gray-100"
        id="testimonials"
        data-animate
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible.testimonials
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center space-x-2 bg-gray-200 rounded-full px-6 py-3 border border-gray-300 shadow-sm mb-6">
              <Star className="h-5 w-5 text-gray-700 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800">
                Community Stories
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Alumni <span className="text-gray-800">Stories</span>
            </h2>
            <p className="text-lg text-gray-600">
              Hear inspiring stories from our alumni and educational
              institutions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div
              className={`bg-white rounded-xl shadow-sm p-8 md:p-12 text-center border border-gray-200 relative overflow-hidden transform transition-all duration-1000 ${
                isVisible.testimonials
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: "50ms" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>

              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 text-gray-500 fill-current mx-1 transform transition-all duration-300 hover:scale-125`}
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animation: "twinkle 2s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>

              <div className="relative h-56 flex items-center justify-center">
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
                    <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="border-t border-gray-200 pt-6">
                      <div className="font-bold text-lg text-gray-900 mb-2">
                        {testimonial.author}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {testimonial.batch}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentTestimonial
                      ? "bg-gray-800 scale-125 shadow-sm"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-20 bg-gray-900 relative overflow-hidden"
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
          className={`max-w-5xl mx-auto px-6 text-center relative z-10 transform transition-all duration-1000 ${
            isVisible.cta
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-50 mb-8">
            Ready to Make a <span className="text-gray-300">Difference</span>?
          </h2>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Join thousands of alumni supporting education worldwide. Every
            contribution counts in shaping the future of students and
            strengthening educational institutions across the globe.
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-50 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="group">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <GraduationCap className="h-5 w-5 text-gray-900" />
                </div>
                <div>
                  <span className="text-lg font-bold">Alumni Connect</span>
                  <div className="text-sm text-gray-400">
                    Support & Give Back
                  </div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Connecting graduates with their educational institutions
                worldwide, fostering support and creating lasting impact through
                transparent giving.
              </p>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                For Alumni
              </h3>
              <ul className="space-y-3 text-gray-400">
                {[
                  "Find Your School",
                  "Browse Projects",
                  "Make Donation",
                  "Track Impact",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                For Schools
              </h3>
              <ul className="space-y-3 text-gray-400">
                {[
                  "Register School",
                  "Create Projects",
                  "Connect with Alumni",
                  "Track Donations",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3 className="text-base font-semibold mb-6 text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                Support
              </h3>
              <ul className="space-y-3 text-gray-400">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-gray-50 transition-all duration-300 hover:translate-x-2 transform inline-block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="mb-4 md:mb-0 hover:text-gray-300 transition-colors duration-300">
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
