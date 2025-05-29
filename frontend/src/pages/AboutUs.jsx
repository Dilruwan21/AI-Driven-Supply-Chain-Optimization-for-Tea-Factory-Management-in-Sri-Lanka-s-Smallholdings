import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaUsers, FaChartLine } from "react-icons/fa";
// Importing background image
import factoryBackground from "../assets/h6.jpg"; // Replace with your actual image path

const AboutUsPage = () => {
  return (
    // Changed gradient background to image background with overlay for better text readability
    <div
      className="min-h-screen px-6 py-16 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${factoryBackground})` }}
    >
      {/* Main content container with relative positioning */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero section with animation */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16" // Increased bottom margin for more space
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Lanka Leaf Tea Factory
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Empowering Sri Lanka's tea industry with smart management,
            transparency, and data-driven insights for sustainable growth.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Vision card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl shadow-lg bg-white bg-opacity-90 p-6 hover:bg-opacity-100 transition">
              <div className="flex flex-col items-center">
                <FaLeaf className="text-green-600 text-4xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                <p className="text-center text-gray-700">
                  To revolutionize Sri Lankan tea production with technology,
                  optimizing quality and efficiency from garden to global
                  markets.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Team card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl shadow-lg bg-white bg-opacity-90 p-6 hover:bg-opacity-100 transition">
              <div className="flex flex-col items-center">
                <FaUsers className="text-green-600 text-4xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">Who We Are</h3>
                <p className="text-center text-gray-700">
                  Lanka Leaf combines generations of tea expertise with modern
                  technology to build smart solutions for Sri Lanka's tea
                  industry.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Services card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl shadow-lg bg-white bg-opacity-90 p-6 hover:bg-opacity-100 transition">
              <div className="flex flex-col items-center">
                <FaChartLine className="text-green-600 text-4xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">What We Do</h3>
                <p className="text-center text-gray-700">
                  From real-time data collection to AI-based yield prediction,
                  we enhance productivity while preserving traditional quality.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="mt-20 text-center" // Increased top margin for more space
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Join Lanka Leaf's Journey
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
            Discover how our management system can transform your tea
            operations. Schedule a demo or download our brochure to learn more.
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg shadow-md transition transform hover:scale-105"
              onClick={() => (window.location.href = "/ContactUs")}
            >
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;
