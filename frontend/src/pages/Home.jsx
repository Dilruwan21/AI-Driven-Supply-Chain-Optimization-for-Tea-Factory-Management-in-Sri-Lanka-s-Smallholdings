import React, { useEffect, useState } from "react";
import { href, Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Fade from "react-bootstrap/Fade";
import { useSpring, animated, config, useTrail } from "@react-spring/web";
import h4 from "../assets/h4.jpg";
import a1 from "../assets/a2.png";
import {
  FaSeedling,
  FaIndustry,
  FaShippingFast,
  FaChartLine,
  FaCalendarAlt,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { GiPlantWatering, GiTeapot } from "react-icons/gi";

/**
 * Static data for features cards - defined outside component to avoid initialization issues
 * Each feature has:
 * - icon: JSX element for the visual representation
 * - title: Header text for the card
 * - features: Array of bullet points describing the feature
 */
const features = [
  {
    icon: (
      <div className="relative">
        <FaSeedling className="text-4xl" />
        <GiPlantWatering className="absolute -top-2 -right-2 text-xl" />
      </div>
    ),
    title: "Tea Garden Owners",
    features: [
      "Real-time crop health monitoring",
      "Monthly yield & earnings predictions",
      "Financial dashboard with expense tracking",
      "Weather-based cultivation advice",
    ],
  },
  {
    icon: (
      <div className="relative">
        <FaIndustry className="text-4xl" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
      </div>
    ),
    title: "Factory Managers",
    features: [
      "Production scheduling system",
      "Smart inventory management",
      "Quality control analytics",
      "Real-time processing charts",
    ],
  },
  {
    icon: <FaShippingFast className="text-4xl" />,
    title: "Transport Partners",
    features: [
      "Live shipment tracking",
      "Dynamic route optimization",
      "Delivery schedule management",
      "Fuel efficiency analytics",
    ],
  },
];

/**
 * Static data for platform features section
 * Each item has:
 * - icon: React icon component
 * - title: Feature title
 * - text: Short description
 */
const platformFeatures = [
  {
    icon: <FaMoneyCheckAlt />,
    title: "Financial Forecasting",
    text: "Predict monthly earnings with AI-driven models",
  },
  {
    icon: <FaCalendarAlt />,
    title: "Smart Scheduling",
    text: "Automated production & delivery timelines",
  },
  {
    icon: <FaChartLine />,
    title: "Real-time Analytics",
    text: "Interactive dashboards with live data feeds",
  },
];

const HomePage = () => {
  // State management
  const [loaded, setLoaded] = useState(false); // Controls initial load animation
  const [iconHovered, setIconHovered] = useState(
    Array(features.length).fill(false)
  ); // Tracks hover state for feature icons
  const [teapotHovered, setTeapotHovered] = useState(false); // Tracks hover state for teapot icon
  const [autoAnimate, setAutoAnimate] = useState(false); // Controls auto-animation toggle

  // Toggle auto-animations every 3 seconds
  useEffect(() => {
    setLoaded(true);

    const interval = setInterval(() => {
      setAutoAnimate((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ===================== ANIMATION CONFIGURATIONS =====================

  /**
   * Hero section animations - fade in with slight bounce
   */
  const heroTitleAnim = useSpring({
    from: { opacity: 0, transform: "translateY(30px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 300,
    config: config.wobbly,
  });

  const heroTextAnim = useSpring({
    from: { opacity: 0, transform: "translateY(30px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 500,
    config: config.wobbly,
  });

  const heroButtonAnim = useSpring({
    from: { opacity: 0, transform: "translateY(30px)" },
    to: { opacity: 1, transform: "translateY(0)" },
    delay: 700,
    config: config.wobbly,
  });

  /**
   * AnimatedFeatureIcon component - handles hover and auto animations for feature icons
   * @param {Object} props - Component props
   * @param {ReactNode} props.children - Icon JSX to animate
   * @param {number} props.index - Index of the icon in features array
   */
  const AnimatedFeatureIcon = ({ children, index }) => {
    // Auto-animation spring that pulses when autoAnimate state changes
    const autoAnim = useSpring({
      transform: autoAnimate
        ? `scale(1.15) rotate(${index % 2 === 0 ? -3 : 3}deg)`
        : "scale(1) rotate(0deg)",
      config: config.gentle,
    });

    // Hover animation spring
    const [hoverAnim, hoverApi] = useSpring(() => ({
      transform: "scale(1) rotate(0deg)",
      color: "#16a34a",
      config: config.wobbly,
    }));

    return (
      <animated.div
        style={{
          ...autoAnim,
          ...hoverAnim,
        }}
        onMouseEnter={() => {
          setIconHovered((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          hoverApi.start({
            transform: `scale(1.25) rotate(${index % 2 === 0 ? -8 : 8}deg)`,
            color: "#22c55e",
          });
        }}
        onMouseLeave={() => {
          setIconHovered((prev) => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });
          hoverApi.start({
            transform: "scale(1) rotate(0deg)",
            color: "#16a34a",
          });
        }}
        className="mb-4"
      >
        {children}
      </animated.div>
    );
  };

  /**
   * Teapot icon animation - combines hover and auto animations
   */
  const teapotAnim = useSpring({
    transform: teapotHovered
      ? "rotate(-12deg) translateY(-8px)"
      : autoAnimate
      ? "rotate(5deg) translateY(-3px)"
      : "rotate(0deg) translateY(0)",
    config: config.wobbly,
  });

  // Trail animation for feature cards (staggered entrance)
  const trail = useTrail(features.length, {
    from: { opacity: 0, transform: "translateY(50px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    delay: 1400,
    config: config.stiff,
  });

  // Trail animation for feature items (staggered list items)
  const featureItemTrail = useTrail(4, {
    from: { opacity: 0, transform: "translateX(-20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    delay: 1600,
    config: config.gentle,
  });

  // ===================== COMPONENT RENDER =====================

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative h-screen flex items-center justify-center bg-green-900/90 overflow-hidden">
        {/* Background image with subtle zoom animation */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <animated.img
            src={h4}
            alt="Tea Plantation"
            className="w-full h-full object-cover"
            style={useSpring({
              from: { transform: "scale(1.1)" },
              to: { transform: "scale(1)" },
              config: { duration: 15000 },
            })}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/70"></div>
        </div>

        {/* Hero content with fade-in animation */}
        <Fade in={loaded} appear>
          <div className="text-center relative z-10 text-white px-4">
            <animated.h1
              style={heroTitleAnim}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Modern Tea Factory Management
              <span className="block text-green-300 mt-2">Made Simple</span>
            </animated.h1>
            <animated.p
              style={heroTextAnim}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Streamline operations for Garden Owners, Factory Managers, and
              Transport Partners with LankaLeaf's Integrated Platform
            </animated.p>
            <animated.div style={heroButtonAnim}>
              <Button
                as={Link}
                to="/ContactUs"
                variant="success"
                size="lg"
                className="px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
              >
                Get Started
              </Button>
            </animated.div>
          </div>
        </Fade>

        {/* Animated scroll indicator */}
        <animated.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          style={useSpring({
            from: { opacity: 0, y: 20 },
            to: { opacity: 1, y: 0 },
            delay: 1000,
            config: config.wobbly,
          })}
        >
          <div className="animate-bounce flex flex-col items-center">
            <span className="text-white mb-2">Scroll Down</span>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </animated.div>
      </section>

      {/* ===================== SECTION TRANSITION ===================== */}
      <animated.div
        className="relative h-16 bg-gradient-to-b from-green-900 to-gray-50"
        style={useSpring({
          from: { opacity: 0 },
          to: { opacity: 1 },
          delay: 1200,
        })}
      >
        <svg
          className="absolute top-0 w-full h-full text-gray-50"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L100,0 L100,10 C50,50 50,50 0,10 Z"
            fill="currentColor"
          />
        </svg>
      </animated.div>

      {/* ===================== FEATURES SECTION ===================== */}
      <section className="py-16 bg-gray-50">
        <Container>
          {/* Section header with fade-in animation */}
          <animated.div
            style={useSpring({
              from: { opacity: 0, transform: "translateY(30px)" },
              to: { opacity: 1, transform: "translateY(0)" },
              delay: 1300,
              config: config.wobbly,
            })}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
              AI-Powered Management Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Smart tools for modern tea industry management
            </p>
          </animated.div>

          {/* Feature cards with staggered animations */}
          <Row className="g-4 justify-content-center">
            {trail.map((style, idx) => (
              <Col lg={4} md={6} key={idx} className="d-flex">
                <animated.div style={style} className="w-100">
                  <div
                    className="bg-white p-5 rounded-xl shadow-lg h-100 d-flex flex-column hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                    onMouseEnter={() =>
                      setIconHovered((prev) => {
                        const newState = [...prev];
                        newState[idx] = true;
                        return newState;
                      })
                    }
                    onMouseLeave={() =>
                      setIconHovered((prev) => {
                        const newState = [...prev];
                        newState[idx] = false;
                        return newState;
                      })
                    }
                  >
                    {/* Feature icon with combined hover and auto animations */}
                    <div className="text-center">
                      <AnimatedFeatureIcon index={idx}>
                        {features[idx].icon}
                      </AnimatedFeatureIcon>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center text-green-900">
                      {features[idx].title}
                    </h3>
                    {/* Feature list items with staggered animation */}
                    <ul className="flex-grow-1">
                      {features[idx].features.map((item, i) => (
                        <animated.li
                          key={i}
                          className="mb-3 flex items-start text-gray-600"
                          style={featureItemTrail[i]}
                        >
                          <animated.span
                            className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"
                            style={{
                              transform: iconHovered[idx]
                                ? "scale(1.5)"
                                : "scale(1)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                          {item}
                        </animated.li>
                      ))}
                    </ul>
                  </div>
                </animated.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===================== PLATFORM FEATURES SECTION ===================== */}
      <section className="py-16 bg-white">
        <Container>
          <Row className="align-items-center g-5">
            <Col md={6}>
              {/* Dashboard image with animated teapot */}
              <animated.div
                style={useSpring({
                  from: { opacity: 0, transform: "translateX(-50px)" },
                  to: { opacity: 1, transform: "translateX(0)" },
                  delay: 2000,
                  config: config.wobbly,
                })}
              >
                <div className="relative">
                  <img
                    src={a1}
                    alt="Analytics Dashboard"
                    className="rounded-lg shadow-xl transform hover:rotate-1 transition-transform duration-300"
                  />
                  {/* Teapot icon with combined hover and auto animations */}
                  <animated.div
                    className="absolute -bottom-4 -right-4 bg-green-100 p-4 rounded-lg shadow-md"
                    style={teapotAnim}
                    onMouseEnter={() => setTeapotHovered(true)}
                    onMouseLeave={() => setTeapotHovered(false)}
                  >
                    <GiTeapot
                      className="text-3xl text-green-600"
                      style={{
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </animated.div>
                </div>
              </animated.div>
            </Col>
            <Col md={6}>
              {/* Platform features list */}
              <animated.div
                style={useSpring({
                  from: { opacity: 0, transform: "translateX(50px)" },
                  to: { opacity: 1, transform: "translateX(0)" },
                  delay: 2000,
                  config: config.wobbly,
                })}
              >
                <div className="pl-0 md:pl-8">
                  <h2 className="text-3xl font-bold mb-6 text-green-900">
                    Intelligent Analytics Platform
                  </h2>
                  <div className="space-y-6">
                    {platformFeatures.map((item, idx) => (
                      <animated.div
                        key={idx}
                        className="flex items-start space-x-4 p-4 hover:bg-green-50 rounded-lg transition-all duration-300 hover:shadow-md"
                        style={useSpring({
                          from: { opacity: 0, transform: "translateY(30px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                          delay: 2200 + idx * 200,
                          config: config.wobbly,
                        })}
                      >
                        {/* Platform feature icon with animations */}
                        <div className="text-green-600 text-2xl mt-1">
                          <AnimatedFeatureIcon index={idx + features.length}>
                            {item.icon}
                          </AnimatedFeatureIcon>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {item.title}
                          </h4>
                          <p className="text-gray-600">{item.text}</p>
                        </div>
                      </animated.div>
                    ))}
                  </div>
                </div>
              </animated.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="py-16 bg-green-50">
        <Container className="text-center">
          <animated.div
            style={useSpring({
              from: { opacity: 0, transform: "translateY(50px)" },
              to: { opacity: 1, transform: "translateY(0)" },
              delay: 2800,
              config: config.wobbly,
            })}
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-green-900">
                Transform Your Tea Business Today
              </h2>
              <p className="text-xl mb-8 text-gray-700">
                Join 500+ tea professionals using AI-driven predictions and
                real-time analytics
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  as={Link}
                  to="/ContactUs"
                  variant="success"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  Join Now
                </Button>
                <Button
                  as={Link}
                  to="/AboutUs"
                  variant="outline-success"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
                >
                  More Details
                </Button>
              </div>
            </div>
          </animated.div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
