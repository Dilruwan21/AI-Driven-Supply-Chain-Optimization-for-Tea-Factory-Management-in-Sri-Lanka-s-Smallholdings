import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCloudSun,
  FaSearch,
  FaTint,
  FaWind,
  FaCloudRain,
  FaSun,
  FaSnowflake,
  FaLeaf,
  FaTimes,
  FaThermometerHalf,
  FaSeedling,
  FaUmbrella,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMountain,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading-tea.json";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const Weather = () => {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayLocation, setDisplayLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchElevation = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
      );
      return response.data.results[0].elevation;
    } catch (error) {
      console.error("Error fetching elevation:", error);
      return 600;
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(location);
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  const selectSuggestion = async (suggestion) => {
    const displayName = `${suggestion.name}, ${
      suggestion.state || suggestion.country
    }`;
    setLocation(displayName);
    setDisplayLocation(displayName);
    setSuggestions([]);
    setShowSuggestions(false);
    await fetchWeatherData(suggestion.lat, suggestion.lon);
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      setIsAnalyzing(true);
      setError(null);

      const elevation = await fetchElevation(lat, lon);
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const transformedData = {
        current: {
          temp: currentRes.data.main.temp,
          humidity: currentRes.data.main.humidity,
          weather: currentRes.data.weather[0],
          wind_speed: currentRes.data.wind.speed,
          rain: currentRes.data.rain?.["1h"] || 0,
          clouds: currentRes.data.clouds?.all || 0,
          pressure: currentRes.data.main.pressure,
          elevation,
          sea_level: currentRes.data.main.sea_level || 0,
        },
        daily: forecastRes.data.list
          .filter((_, index) => index % 8 === 0)
          .slice(0, 5)
          .map((item) => ({
            dt: item.dt,
            temp: {
              max: item.main.temp_max,
              min: item.main.temp_min,
            },
            humidity: item.main.humidity,
            weather: item.weather[0],
            wind_speed: item.wind.speed,
            rain: item.rain?.["3h"] || 0,
            clouds: item.clouds?.all || 0,
          })),
      };

      setWeatherData(transformedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const getWeatherIcon = (id) => {
    const iconProps = { className: "text-4xl" };
    if (id >= 200 && id < 300)
      return <FaCloudRain {...iconProps} style={{ color: "#3b82f6" }} />;
    if (id >= 300 && id < 600)
      return <FaCloudRain {...iconProps} style={{ color: "#64748b" }} />;
    if (id >= 600 && id < 700)
      return <FaSnowflake {...iconProps} style={{ color: "#bfdbfe" }} />;
    if (id === 800)
      return <FaSun {...iconProps} style={{ color: "#f59e0b" }} />;
    return <FaCloudSun {...iconProps} style={{ color: "#94a3b8" }} />;
  };

  const getGrowthImpact = (weather) => {
    const {
      temp,
      humidity,
      rain,
      wind_speed,
      clouds,
      elevation = 600,
    } = weather;
    const avgTemp = temp.min ? (temp.min + temp.max) / 2 : temp;

    if (avgTemp < 10)
      return {
        level: "Critical",
        color: "bg-red-100 text-red-800",
        impact: "Frost damage risk - Cover plants at night",
        effect: "Reduces photosynthesis, damages tender leaves",
        recommendation:
          elevation > 1200
            ? "Use frost covers at night, these temperatures are unusual for this elevation"
            : "Use frost covers at night, delay plucking until temperature rises",
        condition: "Too Cold",
        icon: <FaSnowflake className="text-red-500" />,
      };

    if (avgTemp > 35)
      return {
        level: "Critical",
        color: "bg-red-100 text-red-800",
        impact: "Heat stress - Increase shade and irrigation",
        effect: "Causes leaf scorching, reduces photosynthesis",
        recommendation: "Increase shade trees, irrigate in early morning",
        condition: "Too Hot",
        icon: <FaThermometerHalf className="text-red-500" />,
      };

    if (elevation > 1200 && avgTemp >= 12 && avgTemp <= 18)
      return {
        level: "Optimal",
        color: "bg-green-100 text-green-800",
        impact: "Ideal high-grown conditions",
        effect: "Promotes slow growth and complex flavor development",
        recommendation: "Maintain current practices, expect premium quality",
        condition: "Perfect High-Grown",
        icon: <FaMountain className="text-green-500" />,
      };

    if (rain > 30)
      return {
        level: "High",
        color: "bg-purple-100 text-purple-800",
        impact: "Excess rainfall - Check drainage",
        effect: "May cause root rot and nutrient leaching",
        recommendation: "Improve drainage, monitor for fungal diseases",
        condition: "Heavy Rain",
        icon: <FaUmbrella className="text-purple-500" />,
      };

    if (humidity < 60)
      return {
        level: "Moderate",
        color: "bg-yellow-100 text-yellow-800",
        impact: "Low humidity - Increase irrigation",
        effect: "Promotes pest infestation (mites, thrips)",
        recommendation: "Increase mist irrigation, monitor pest levels",
        condition: "Low Humidity",
        icon: <FaTint className="text-yellow-500" />,
      };

    if (humidity > 90)
      return {
        level: "High",
        color: "bg-blue-100 text-blue-800",
        impact: "High humidity - Monitor for fungal growth",
        effect: "Slows drying of plucked leaves, increases disease risk",
        recommendation: "Improve ventilation, space plants properly",
        condition: "High Humidity",
        icon: <FaTint className="text-blue-500" />,
      };

    if (wind_speed > 8)
      return {
        level: "Moderate",
        color: "bg-cyan-100 text-cyan-800",
        impact: "High wind - Protect young shoots",
        effect: "Causes physical damage to tender leaves",
        recommendation: "Plant windbreaks, delay plucking in windy conditions",
        condition: "Windy",
        icon: <FaWind className="text-cyan-500" />,
      };

    if (clouds < 30)
      return {
        level: "Moderate",
        color: "bg-amber-100 text-amber-800",
        impact: "Intense sunlight - Check for leaf scorch",
        effect: "May cause sunburn on young leaves",
        recommendation: "Maintain shade trees at 30-40% coverage",
        condition: "Strong Sun",
        icon: <FaSun className="text-amber-500" />,
      };

    if (clouds > 80)
      return {
        level: "Moderate",
        color: "bg-gray-100 text-gray-800",
        impact: "Low sunlight - Monitor growth rate",
        effect: "Reduces photosynthesis, slows shoot development",
        recommendation: "Consider pruning shade trees if prolonged",
        condition: "Low Sun",
        icon: <FaCloudSun className="text-gray-500" />,
      };

    return {
      level: "Optimal",
      color: "bg-green-100 text-green-800",
      impact: "Good growing conditions",
      effect: "Promotes healthy flush growth",
      recommendation:
        elevation > 1200
          ? "Ideal high-grown tea conditions - maintain current practices"
          : "Continue standard cultivation practices",
      condition: "Good",
      icon: <FaLeaf className="text-green-500" />,
    };
  };

  const getTeaQualityPrediction = (weather) => {
    const { temp, humidity, rain, clouds, elevation = 600 } = weather;
    const avgTemp = temp.min ? (temp.min + temp.max) / 2 : temp;

    if (elevation > 1200) {
      if (avgTemp >= 12 && avgTemp <= 18 && humidity >= 75 && humidity <= 90) {
        return {
          quality: "Premium High-Grown",
          description:
            "Ideal cool climate conditions for delicate flavor development",
          color: "bg-purple-100 text-purple-800",
        };
      }
      if (avgTemp >= 10 && avgTemp <= 20) {
        return {
          quality: "High-Grown Specialty",
          description: "Excellent conditions for high-quality tea",
          color: "bg-blue-100 text-blue-800",
        };
      }
    }

    if (elevation > 600) {
      if (avgTemp >= 18 && avgTemp <= 24 && humidity >= 70 && humidity <= 85) {
        return {
          quality: "Premium Mid-Grown",
          description: "Optimal conditions for balanced flavor profile",
          color: "bg-blue-100 text-blue-800",
        };
      }
    }

    if (
      avgTemp >= 18 &&
      avgTemp <= 22 &&
      humidity >= 70 &&
      humidity <= 85 &&
      rain <= 10
    ) {
      return {
        quality: "Premium",
        description: "Expect excellent flavor and aroma development",
        color: "bg-purple-100 text-purple-800",
      };
    }
    if (avgTemp >= 22 && avgTemp <= 26 && humidity >= 65 && humidity <= 90) {
      return {
        quality: "High",
        description: "Good conditions for balanced flavor profile",
        color: "bg-blue-100 text-blue-800",
      };
    }

    return {
      quality: elevation > 1200 ? "High-Grown Standard" : "Standard",
      description:
        elevation > 1200
          ? "Standard for high-grown tea (still better than low-grown premium)"
          : "Average quality expected under these conditions",
      color: "bg-gray-100 text-gray-800",
    };
  };

  const getElevationAdvice = (elevation) => {
    if (elevation > 1200) {
      return {
        type: "High-grown (Premium)",
        advice:
          "Ideal for premium quality tea with delicate flavor. Cool temperatures slow growth but enhance flavor complexity.",
        characteristic: "Slow growth, fine flavor, light golden liquor",
      };
    }
    if (elevation > 600) {
      return {
        type: "Mid-grown",
        advice: "Balanced growth rate. Good for both quality and quantity.",
        characteristic: "Medium-bodied, well-balanced flavor",
      };
    }
    return {
      type: "Low-grown",
      advice:
        "Fast growth, focus on pest management. Good for strong, robust teas.",
      characteristic: "Brisk, strong flavor, dark liquor",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Tea Garden Weather Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Understand how weather affects your tea cultivation
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="bg-gradient-to-r from-green-400 to-blue-400 h-1 mx-auto rounded-full"
          />
        </motion.div>

        {/* Weather Importance Cards - Shown BEFORE search */}
        {!weatherData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
            >
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <FaThermometerHalf className="text-red-500" /> Why Weather
                Matters
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaSnowflake className="text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Temperature Effects</h4>
                    <p className="text-sm text-gray-600">
                      Tea quality varies dramatically with temperature. Cooler
                      temperatures (12-18°C) produce more complex flavors.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <FaTint className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Humidity Impact</h4>
                    <p className="text-sm text-gray-600">
                      Ideal humidity (70-85%) prevents pests and fungal diseases
                      while maintaining leaf moisture.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <FaSun className="text-amber-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Sunlight Needs</h4>
                    <p className="text-sm text-gray-600">
                      4-6 hours of filtered sunlight is ideal for balanced
                      growth without leaf scorching.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-green-200"
            >
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" /> How This Helps You
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <FaLeaf className="text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Growth Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Get specific recommendations based on current weather
                      conditions in your garden.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                  <FaSeedling className="text-cyan-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Quality Prediction</h4>
                    <p className="text-sm text-gray-600">
                      Understand expected tea quality based on weather patterns
                      and elevation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <FaUmbrella className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Actionable Advice</h4>
                    <p className="text-sm text-gray-600">
                      Receive specific cultivation recommendations to optimize
                      your harvest.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Search Field */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-2xl mx-auto relative"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for your tea garden location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full border-2 border-green-200 rounded-lg p-4 pl-12 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {location && (
                <button
                  onClick={() => {
                    setLocation("");
                    setSuggestions([]);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (location.trim()) {
                  fetchSuggestions(location);
                }
              }}
              disabled={loading}
              className={`px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Searching..." : "Analyze"}
            </button>
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.lat}-${suggestion.lon}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.state && `${suggestion.state}, `}
                      {suggestion.country}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"
            >
              <FaExclamationTriangle /> {error}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-64 h-64">
                <Lottie animationData={loadingAnimation} loop={true} />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="text-lg font-medium text-green-700"
              >
                Analyzing weather conditions for your tea garden...
              </motion.div>
              <p className="text-gray-600 mt-2">
                Checking temperature, humidity, rainfall and elevation data
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {weatherData && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-semibold text-gray-800">
                  Weather for {displayLocation}
                </h2>
                <p className="text-gray-600 mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {weatherData.current.elevation && (
                  <div className="mt-2 flex justify-center gap-4">
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <FaMountain className="inline mr-1" />
                      Elevation: {Math.round(weatherData.current.elevation)}m
                    </div>
                    {weatherData.current.sea_level && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <FaTint className="inline mr-1" />
                        Sea Level: {weatherData.current.sea_level}hPa
                      </div>
                    )}
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {getElevationAdvice(weatherData.current.elevation).type}
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <FaThermometerHalf className="text-red-500" /> Current
                    Conditions
                  </h3>

                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-center"
                    >
                      {getWeatherIcon(weatherData.current.weather.id)}
                      <p className="capitalize text-lg mt-2 text-gray-700">
                        {weatherData.current.weather.description}
                      </p>
                    </motion.div>

                    <div className="text-center flex-1">
                      <div className="text-5xl font-bold text-gray-800">
                        {Math.round(weatherData.current.temp)}°C
                      </div>
                      <div className="text-gray-500 mt-2">
                        Feels like {Math.round(weatherData.current.temp)}°C
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-blue-50 p-4 rounded-lg flex items-center gap-3"
                      >
                        <FaTint className="text-blue-500 text-xl" />
                        <div>
                          <div className="text-sm text-gray-500">Humidity</div>
                          <div className="font-semibold">
                            {weatherData.current.humidity}%
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-green-50 p-4 rounded-lg flex items-center gap-3"
                      >
                        <FaWind className="text-green-500 text-xl" />
                        <div>
                          <div className="text-sm text-gray-500">Wind</div>
                          <div className="font-semibold">
                            {weatherData.current.wind_speed} m/s
                          </div>
                        </div>
                      </motion.div>
                      {weatherData.current.rain > 0 && (
                        <motion.div
                          whileHover={{ y: -3 }}
                          className="bg-purple-50 p-4 rounded-lg flex items-center gap-3 col-span-2"
                        >
                          <FaUmbrella className="text-purple-500 text-xl" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Rain (1h)
                            </div>
                            <div className="font-semibold">
                              {weatherData.current.rain} mm
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-amber-50 p-4 rounded-lg flex items-center gap-3"
                      >
                        <FaSun className="text-amber-500 text-xl" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Cloud Cover
                          </div>
                          <div className="font-semibold">
                            {weatherData.current.clouds}%
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-cyan-50 p-4 rounded-lg flex items-center gap-3"
                      >
                        <FaInfoCircle className="text-cyan-500 text-xl" />
                        <div>
                          <div className="text-sm text-gray-500">Pressure</div>
                          <div className="font-semibold">
                            {weatherData.current.pressure} hPa
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 border-t">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaLeaf className="text-green-600" /> Tea Growth Analysis
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg ${
                        getGrowthImpact(weatherData.current).color
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getGrowthImpact(weatherData.current).icon}
                        <div>
                          <div className="font-bold">
                            {getGrowthImpact(weatherData.current).condition}
                          </div>
                          <div className="text-sm">
                            {getGrowthImpact(weatherData.current).level} Impact
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {getGrowthImpact(weatherData.current).impact}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-4 rounded-lg border"
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        Expected Effect on Tea
                      </div>
                      <div className="font-medium">
                        {getGrowthImpact(weatherData.current).effect}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg ${
                        getTeaQualityPrediction(weatherData.current).color
                      }`}
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        Predicted Tea Quality
                      </div>
                      <div className="font-bold text-lg mb-1">
                        {getTeaQualityPrediction(weatherData.current).quality}
                      </div>
                      <div className="text-sm">
                        {
                          getTeaQualityPrediction(weatherData.current)
                            .description
                        }
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 bg-white p-4 rounded-lg border border-green-200"
                  >
                    <div className="font-medium text-green-700 mb-2">
                      Garden Owner Advice
                    </div>
                    <div className="text-sm">
                      {getGrowthImpact(weatherData.current).recommendation}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">
                        Elevation Characteristics:
                      </span>{" "}
                      {
                        getElevationAdvice(weatherData.current.elevation)
                          .characteristic
                      }
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <FaSeedling className="text-green-500" /> 5-Day Forecast
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {weatherData.daily.map((day, index) => {
                      const growthImpact = getGrowthImpact({
                        ...day,
                        elevation: weatherData.current.elevation,
                      });
                      const quality = getTeaQualityPrediction({
                        ...day,
                        elevation: weatherData.current.elevation,
                      });
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{
                            y: -5,
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                          className="border rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="font-medium text-center">
                            {new Date(day.dt * 1000).toLocaleDateString(
                              "en-US",
                              { weekday: "short" }
                            )}
                          </div>
                          <div className="flex justify-center my-3">
                            {getWeatherIcon(day.weather.id)}
                          </div>
                          <div className="text-center mb-3">
                            <span className="font-bold text-lg">
                              {Math.round(day.temp.max)}°
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                              /{Math.round(day.temp.min)}°
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FaTint className="text-blue-400" />{" "}
                              {day.humidity}%
                            </div>
                            <div className="flex items-center gap-2">
                              <FaWind className="text-green-400" />{" "}
                              {day.wind_speed} m/s
                            </div>
                            {day.rain > 0 && (
                              <div className="flex items-center gap-2">
                                <FaCloudRain className="text-purple-400" />{" "}
                                {day.rain} mm
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FaCloudSun className="text-amber-400" />{" "}
                              {day.clouds}%
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            <div
                              className={`p-1 rounded text-xs text-center ${growthImpact.color}`}
                            >
                              {growthImpact.condition}
                            </div>
                            <div
                              className={`p-1 rounded text-xs text-center ${quality.color}`}
                            >
                              {quality.quality} Quality
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" /> Ideal Tea Growing
                  Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">
                      Optimal Weather Parameters
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <FaThermometerHalf className="text-red-400 mt-1" />
                        <span>
                          <strong>High-Grown (&gt;1200m):</strong> 12-18°C
                          <br />
                          <strong>Mid-Grown (600-1200m):</strong> 18-24°C
                          <br />
                          <strong>Low-Grown (&lt;600m):</strong> 24-30°C
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FaTint className="text-blue-400 mt-1" />
                        <span>
                          <strong>Humidity:</strong> 70-85% (Avoid prolonged
                          periods below 60% or above 90%)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCloudRain className="text-purple-400 mt-1" />
                        <span>
                          <strong>Rainfall:</strong> 1,200-2,500mm annually,
                          evenly distributed
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">
                      Regional Characteristics
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>
                        <strong>High Elevation:</strong> Delicate, floral
                        flavors with light golden liquor
                      </li>
                      <li>
                        <strong>Mid Elevation:</strong> Well-balanced flavor
                        with medium body
                      </li>
                      <li>
                        <strong>Low Elevation:</strong> Strong, robust teas with
                        dark liquor
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!weatherData && !loading && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 4,
                }}
              >
                <FaCloudSun className="text-gray-300 text-6xl mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Ready to Analyze Your Tea Garden
              </h3>
              <p className="text-gray-500 mb-6">
                Enter your location above to get detailed weather analysis and
                cultivation recommendations.
              </p>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="bg-gradient-to-r from-green-400 to-blue-400 h-1 w-24 mx-auto mb-6 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Weather;
