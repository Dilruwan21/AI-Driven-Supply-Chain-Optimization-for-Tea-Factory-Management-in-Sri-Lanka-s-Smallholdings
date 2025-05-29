import { useState } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaShare } from "react-icons/fa";
import backgroundImage from "../assets/h6.jpg";

const ContactUs = () => {
  // State management for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Send form data to the backend API
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify(formData), // Convert form data to JSON string
      });

      // Handle successful response
      if (response.ok) {
        alert("Message sent successfully!");
        // Reset form fields after successful submission
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      // Handle errors during form submission
      console.error("Error submitting form:", error);
      alert("Error sending message");
    }
  };

  return (
    // Main container with background image
    <div
      className="min-vh-100" // Minimum height of 100vh
      style={{
        backgroundImage: `url(${backgroundImage})`, // Background image from assets
        backgroundSize: "cover", // Cover the entire container
        backgroundPosition: "center", // Center the background
        backgroundAttachment: "fixed", // Fixed background on scroll
        backgroundRepeat: "no-repeat", // No repeating of background
        paddingTop: "6rem", // Top padding for header space
        paddingBottom: "3rem", // Bottom padding
      }}
    >
      {/* Bootstrap container for responsive layout */}
      <div className="container">
        {/* Page heading */}
        <h1 className="text-center mb-5 display-4 fw-bold text-white text-shadow">
          CONTACT LANKA LEAF
        </h1>

        {/* Two-column layout for form and contact details */}
        <div className="row g-5 justify-content-center">
          {/* Left column - Contact Form */}
          <div className="col-md-6">
            {/* Glass card effect container */}
            <div className="card shadow-lg p-4 glass-card">
              {/* Form header with icon */}
              <h2 className="mb-4 text-white">
                <FaShare className="me-2" />
                ONLINE INQUIRY
              </h2>

              {/* Contact form */}
              <form onSubmit={handleSubmit}>
                {/* Name input field */}
                <div className="mb-3">
                  <label className="form-label text-white">Full Name</label>
                  <input
                    type="text"
                    className="form-control glass-input"
                    required // Field is required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Email and Phone in a row */}
                <div className="row g-3 mb-3">
                  {/* Email field */}
                  <div className="col-md-6">
                    <label className="form-label text-white">Email</label>
                    <input
                      type="email"
                      className="form-control glass-input"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  {/* Phone field */}
                  <div className="col-md-6">
                    <label className="form-label text-white">Phone</label>
                    <input
                      type="tel"
                      className="form-control glass-input"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Subject field */}
                <div className="mb-3">
                  <label className="form-label text-white">Subject</label>
                  <input
                    type="text"
                    className="form-control glass-input"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                {/* Message textarea */}
                <div className="mb-4">
                  <label className="form-label text-white">Message</label>
                  <textarea
                    className="form-control glass-input"
                    rows="5" // Set initial rows
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100 mt-3"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Right column - Contact Details */}
          <div className="col-md-6">
            {/* Glass card effect container */}
            <div className="card shadow-lg p-4 h-100 glass-card">
              <h2 className="mb-4 text-white">OUR DETAILS</h2>

              {/* Contact information section */}
              <div className="mb-5">
                {/* Company name */}
                <h4 className="text-white mb-3">Lanka Leaf Tea Factory</h4>

                {/* Address section with icon */}
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="text-white me-3 fs-4" />
                  <div>
                    <h5 className="mb-0 text-white">Headquarters & Factory</h5>
                    <p className="text-white-80 mb-0">
                      Haputale - Beragala Road
                      <br />
                      Near Dambatenne Tea Factory
                      <br />
                      Haputale, Sri Lanka
                    </p>
                  </div>
                </div>

                {/* Phone numbers section with icon */}
                <div className="d-flex align-items-center mb-3">
                  <FaPhone className="text-white me-3 fs-4" />
                  <div>
                    <h5 className="mb-0 text-white">Contact Numbers</h5>
                    <p className="text-white-80 mb-0">
                      +94 57 222 2345 (Factory)
                      <br />
                      +94 57 222 2346 (Office)
                      <br />
                      +94 77 123 4567 (Sales)
                    </p>
                  </div>
                </div>

                {/* Email addresses section with icon */}
                <div className="d-flex align-items-center">
                  <FaEnvelope className="text-white me-3 fs-4" />
                  <div>
                    <h5 className="mb-0 text-white">Email Addresses</h5>
                    <p className="text-white-80 mb-0">
                      info@lankaleaf.com
                      <br />
                      sales@lankaleaf.com
                      <br />
                      exports@lankaleaf.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Map section */}
              <div className="mt-auto">
                <h5 className="mb-3 text-white">Our Location in Haputale</h5>
                {/* Responsive map container */}
                <div className="ratio ratio-16x9">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.88140284342!2d80.9563143153262!3d6.766424595100312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae47282a7c30c3d%3A0x4b3e5e8a1a5e8a1b!2sHaputale!5e0!3m2!1sen!2slk!4v1621234567890!5m2!1sen!2slk"
                    className="rounded"
                    allowFullScreen=""
                    loading="lazy" // Lazy load the iframe
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lanka Leaf Tea Factory Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS styles for custom effects */}
      <style jsx>{`
        /* Glass card effect */
        .glass-card {
          background: rgba(255, 255, 255, 0.15); /* Semi-transparent white */
          backdrop-filter: blur(10px); /* Blur effect behind the card */
          border: 1px solid rgba(255, 255, 255, 0.2); /* Light border */
          border-radius: 10px; /* Rounded corners */
        }

        /* Glass input field styling */
        .glass-input {
          background: rgba(
            255,
            255,
            255,
            0.2
          ); /* Semi-transparent background */
          border: 1px solid rgba(255, 255, 255, 0.3); /* Light border */
          color: white; /* White text */
        }

        /* Placeholder text styling */
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.7); /* Semi-transparent white */
        }

        /* Slightly transparent white text */
        .text-white-80 {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Text shadow effect for better readability */
        .text-shadow {
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
