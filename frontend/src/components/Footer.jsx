import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaPinterest,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { motion } from "framer-motion";

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebook size={20} />, name: "Facebook" },
    { icon: <FaTwitter size={20} />, name: "Twitter" },
    { icon: <FaLinkedin size={20} />, name: "LinkedIn" },
    { icon: <FaInstagram size={20} />, name: "Instagram" },
    { icon: <FaPinterest size={20} />, name: "Pinterest" },
  ];

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.footer
      className="bg-white text-gray-800 py-8 border-t border-gray-200"
      initial="hidden"
      whileInView="visible"
      variants={footerVariants}
      viewport={{ once: true }}
    >
      <Container>
        <Row className="mb-6">
          <Col lg={4} className="mb-6 mb-lg-0">
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">About Tea Factory</h3>
              <p className="mb-4">
                We specialize in modern tea factory management solutions that
                streamline operations for garden owners, factory managers, and
                transport partners with our integrated platform.
              </p>
              <p className="font-semibold">- Management Team Lanka Leaf</p>
            </motion.div>
          </Col>

          <Col lg={4} className="mb-6 mb-lg-0">
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Keep Connected</h3>
              <ul className="list-unstyled">
                {socialLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    className="mb-2 flex items-center"
                    whileHover={{ x: 5 }}
                  >
                    <span className="mr-2 text-green-600">{link.icon}</span>
                    {link.name}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Col>

          <Col lg={4}>
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <ul className="list-unstyled">
                <li className="mb-3 flex items-center">
                  <MdLocationOn className="mr-2 text-green-600" size={20} />
                  Tea Factory Headquarters, Colombo Road, Haputale, Sri Lanka
                </li>
                <li className="mb-3 flex items-center">
                  <MdPhone className="mr-2 text-green-600" size={20} />
                  +94 112 345 678
                </li>
                <li className="mb-3 flex items-center">
                  <MdEmail className="mr-2 text-green-600" size={20} />
                  info@teafactory.com
                </li>
              </ul>
            </motion.div>
          </Col>
        </Row>

        <motion.div
          className="pt-6 border-t border-gray-200 text-center"
          variants={itemVariants}
        >
          <p className="mb-2">
            © {new Date().getFullYear()} Final Year Tea Factory Management
            System (Student Id- 10899680) (Lanka Leaf). All rights reserved.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-green-600 transition-colors">
              Company Info
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Terms & Conditions
            </a>
          </div>
        </motion.div>
      </Container>
    </motion.footer>
  );
};

export default Footer;
