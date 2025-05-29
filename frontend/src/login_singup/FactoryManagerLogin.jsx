import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import b1 from "../assets/h7.jpg";
import { motion } from "framer-motion";

const FactoryManagerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/factory-manager/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.email);
      localStorage.setItem("userName", res.data.name);

      setMessage("✅ Login successful");
      setTimeout(() => {
        navigate("/factory-manager-dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      console.error("Login error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/factory-manager/signup",
        { name, email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      setMessage("✅ Account created successfully");
      setTimeout(() => {
        navigate("/factory-manager-dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Signup failed. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      console.error("Signup error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${b1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xs"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden border border-white/20"
        >
          <div className="p-6">
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-center mb-1 text-white"
            >
              Tea Factory Management
            </motion.h2>

            <motion.h3
              variants={itemVariants}
              className="text-lg font-semibold text-center mb-4 text-white"
            >
              {isSignUp ? "Factory Manager Sign Up" : "Factory Manager Login"}
            </motion.h3>

            {message && (
              <motion.p
                variants={itemVariants}
                className={`text-center mb-4 text-sm ${
                  message.includes("✅") ? "text-green-300" : "text-red-300"
                }`}
              >
                {message}
              </motion.p>
            )}

            {isSignUp ? (
              <motion.form onSubmit={handleSignUp} variants={containerVariants}>
                <motion.div variants={itemVariants} className="mb-3">
                  <label className="block text-white/80 mb-1 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-transparent placeholder-white/50"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="mb-3">
                  <label className="block text-white/80 mb-1 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-transparent placeholder-white/50"
                    placeholder="factory@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="mb-4">
                  <label className="block text-white/80 mb-1 text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-transparent placeholder-white/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength="6"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form onSubmit={handleLogin} variants={containerVariants}>
                <motion.div variants={itemVariants} className="mb-3">
                  <label className="block text-white/80 mb-1 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-transparent placeholder-white/50"
                    placeholder="factory@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="mb-4">
                  <label className="block text-white/80 mb-1 text-sm">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-transparent placeholder-white/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging In...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </button>
                </motion.div>
              </motion.form>
            )}

            <motion.p
              variants={itemVariants}
              className="text-center mt-4 text-white/80 text-sm"
            >
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                className="text-blue-300 hover:text-blue-200 font-medium focus:outline-none transition-colors text-sm"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage("");
                }}
              >
                {isSignUp ? "Login" : "Create Account"}
              </button>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FactoryManagerLogin;
