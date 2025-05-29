import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import backgroundImage from "../assets/h6.jpg";
import {
  FaEnvelope,
  FaPaperPlane,
  FaInbox,
  FaUser,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheck,
  FaClock,
  FaTimes,
  FaFileInvoice,
  FaPrint,
  FaNewspaper,
  FaSpinner,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
} from "react-icons/fa";

/**
 * TransportDashboard Component
 *
 * This is the main dashboard for Transport Managers in the tea transport system.
 * It provides functionality for:
 * - Recording tea transport data
 * - Viewing transport schedules
 * - Messaging factory managers and garden owners
 * - Managing transport bills
 * - Viewing tea industry news and best practices
 */
const TransportDashboard = () => {
  // State for garden owner data entry form
  const [teaData, setTeaData] = useState({
    gardenOwner: "",
    gardenName: "",
    teaKilos: "",
    transportDate: "",
  });

  // State for factory price and calculations
  const [factoryPrice, setFactoryPrice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // State for transport records and garden owners
  const [transportList, setTransportList] = useState([]);
  const [gardenOwners, setGardenOwners] = useState([]);

  // State for active tab management
  const [activeTab, setActiveTab] = useState("dashboard");

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");

  // State for messaging system
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState({
    factoryManagers: [],
    gardenOwners: [],
    allRecipients: [],
  });
  const [newMessage, setNewMessage] = useState({
    receiverEmail: "",
    message: "",
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesTab, setMessagesTab] = useState("inbox");

  // State for schedules
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // State for bills
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  // State for news articles
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // State for UI controls
  const [recordsToShow, setRecordsToShow] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "transportDate",
    direction: "descending",
  });

  // State for user guidelines
  const [showGuidelines, setShowGuidelines] = useState(false);

  /**
   * Extracts the transport manager's email from the JWT token stored in localStorage
   * @returns {string|null} The email address of the logged-in user or null if not found
   */
  const getTransportManagerEmail = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.email;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  /**
   * Extracts the transport manager's ID from the JWT token stored in localStorage
   * @returns {string|null} The user ID of the logged-in user or null if not found
   */
  const getTransportManagerId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.id;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Get the current user's email
  const userEmail = getTransportManagerEmail();

  /**
   * Effect hook to fetch initial data when component mounts
   * Fetches transport data, garden owners, and factory price
   */
  useEffect(() => {
    fetchTransportData();
    fetchGardenOwners();
    fetchFactoryPrice();
  }, []);

  /**
   * Effect hook to fetch data when tabs change
   * Fetches appropriate data based on the active tab
   */
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
      fetchRecipients();
    }
    if (activeTab === "schedules") {
      fetchSchedules();
    }
    if (activeTab === "bills") {
      fetchBills();
    }
    if (activeTab === "news") {
      fetchNewsArticles();
    }
  }, [activeTab]);

  /**
   * Effect hook to calculate total amount when tea kilos or factory price changes
   * Automatically updates the total amount based on quantity and price
   */
  useEffect(() => {
    const calculateTotalAmount = () => {
      const kilos = parseFloat(teaData.teaKilos) || 0;
      const price = parseFloat(factoryPrice) || 0;
      const total = kilos * price;
      setTotalAmount(total.toFixed(2));
    };
    calculateTotalAmount();
  }, [teaData.teaKilos, factoryPrice]);

  /**
   * Fetches all transport records from the server
   * Updates the transportList state with the fetched data
   */
  const fetchTransportData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/tea-transport/get-transports"
      );
      setTransportList(response.data);
    } catch (err) {
      console.error("Failed to fetch transport data:", err);
      alert("Failed to load transport data. Please try again.");
    }
  };

  /**
   * Fetches all garden owners from the server
   * Updates the gardenOwners state with the fetched data
   */
  const fetchGardenOwners = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/tea-transport/get-garden-owners"
      );
      setGardenOwners(response.data);
    } catch (err) {
      console.error("Failed to fetch garden owners:", err);
      alert("Failed to load garden owners. Please try again.");
    }
  };

  /**
   * Fetches the current factory price for tea from the server
   * Updates the factoryPrice state with the fetched value
   */
  const fetchFactoryPrice = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tea-price/current"
      );
      setFactoryPrice(response.data.price);
    } catch (err) {
      console.error("Failed to fetch factory tea price:", err);
    }
  };

  /**
   * Fetches bills for the current garden owner from the server
   * Updates the bills state with the fetched data
   */
  const fetchBills = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/tea-transport/bills/garden-owner/${userEmail}`
      );
      setBills(response.data);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      alert("Failed to load bills. Please try again.");
    }
  };

  /**
   * Fetches messages for the current user from the server
   * Updates the messages state with the fetched data
   */
  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${userEmail}`
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Message fetch error:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  /**
   * Fetches all possible message recipients from the server
   * Updates the recipients state with the fetched data
   */
  const fetchRecipients = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/recipients/all"
      );
      setRecipients(response.data);
    } catch (err) {
      console.error("Recipient fetch error:", err);
    }
  };

  /**
   * Fetches transport schedules for the current user from the server
   * Updates the schedules state with the fetched data
   */
  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const managerId = getTransportManagerId();
      const response = await axios.get(
        `http://localhost:5000/tea-transport/schedules/${managerId}`
      );
      setSchedules(response.data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setSchedulesLoading(false);
    }
  };

  /**
   * Fetches tea-related news articles from the server
   * Updates the newsArticles state with the fetched data
   * Includes some default articles if the fetch fails
   */
  const fetchNewsArticles = async () => {
    setIsLoadingNews(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/tea-transport/api/scrape-tea-news"
      );
      const defaultArticles = [
        {
          id: 1,
          title: "Minimize Tea Transport Damage",
          content:
            "Ensure that freshly plucked tea leaves are transported to processing units as quickly as possible to prevent unwanted fermentation.",
          source: "discoveringtea.com",
          image:
            "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: new Date().toISOString().split("T")[0],
        },
        {
          id: 2,
          title: "Proper Packaging for Tea Transport",
          content:
            "Use ventilated bags or containers to allow airflow, reducing heat buildup and moisture accumulation.",
          source: "World Tea Directory",
          image:
            "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: new Date().toISOString().split("T")[0],
        },
      ];
      setNewsArticles([...defaultArticles, ...response.data]);
    } catch (err) {
      console.error("Failed to fetch news articles:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  /**
   * Updates the status of a garden in a schedule
   * @param {string} scheduleId - The ID of the schedule to update
   * @param {number} gardenIndex - The index of the garden in the schedule's gardens array
   * @param {string} newStatus - The new status to set (pending, in-progress, completed)
   */
  const updateGardenStatus = async (scheduleId, gardenIndex, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/tea-transport/schedules/${scheduleId}/garden/${gardenIndex}`,
        { status: newStatus }
      );

      setSchedules((prev) =>
        prev.map((schedule) => {
          if (schedule._id === scheduleId) {
            const updatedGardens = [...schedule.gardens];
            updatedGardens[gardenIndex].status = newStatus;
            return { ...schedule, gardens: updatedGardens };
          }
          return schedule;
        })
      );
    } catch (err) {
      console.error("Error updating garden status:", err);
      alert("Failed to update status");
    }
  };

  /**
   * Handles sending a new message
   * @param {Event} e - The form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/messages/send", {
        ...newMessage,
        senderEmail: userEmail,
      });

      const response = await axios.get(
        `http://localhost:5000/api/messages/${userEmail}`
      );
      setMessages(response.data);
      setNewMessage({ receiverEmail: "", message: "" });
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Message send error:", err);
      alert("Failed to send message");
    }
  };

  /**
   * Handles form input changes for the tea data form
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    setTeaData({ ...teaData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for garden owner data entry
   * Validates data, calculates total amount, and submits to server
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedOwner = gardenOwners.find(
        (owner) => owner.name === teaData.gardenOwner
      );

      if (!factoryPrice) {
        alert("Factory price not set. Please contact factory manager.");
        return;
      }

      const dataToSend = {
        ...teaData,
        gardenOwnerEmail: selectedOwner?.email || "",
        pricePerKg: factoryPrice,
        totalAmount: parseFloat(totalAmount),
        transportManagerEmail: userEmail,
      };

      const response = await axios.post(
        "http://localhost:5000/tea-transport/add-transport",
        dataToSend
      );

      fetchTransportData();
      fetchBills();
      setTeaData({
        gardenOwner: "",
        gardenName: "",
        teaKilos: "",
        transportDate: "",
      });
      setTotalAmount(0);

      if (response.data.billNumber) {
        alert(
          `Transport data added successfully! Bill #${response.data.billNumber} created.`
        );
      } else {
        alert("Transport data added successfully!");
      }
    } catch (err) {
      console.error("Failed to submit transport data:", err);
      alert(
        `Failed to add transport data: ${
          err.response?.data?.error || err.message
        }`
      );
    }
  };

  /**
   * Prepares a bill for printing by setting it as selected
   * Triggers the browser's print dialog after a small delay
   * @param {Object} bill - The bill to print
   */
  // const handlePrintBill = (bill) => {
  //   setSelectedBill(bill);
  //   setTimeout(() => {
  //     window.print();
  //   }, 500);
  // };
  const handlePrintBill = (bill) => {
    setSelectedBill(bill);
    // Give React time to update the state and render the bill
    setTimeout(() => {
      const printContent = document.querySelector(".print-content");
      if (printContent) {
        printContent.classList.remove("hidden");
        window.print();
        // You can optionally hide it again after printing if needed
        setTimeout(() => {
          printContent.classList.add("hidden");
        }, 500);
      }
    }, 100);
  };

  /**
   * Handles sorting of table columns
   * Toggles between ascending and descending order for the specified column
   * @param {string} key - The column key to sort by
   */
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  /**
   * Memoized sorted transport list
   * Returns the transport list sorted based on the current sort configuration
   */
  const sortedTransports = React.useMemo(() => {
    let sortableItems = [...transportList];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transportList, sortConfig]);

  /**
   * Filters transports based on search term and column
   * Returns transports that match the search criteria
   */
  const filteredTransports = sortedTransports.filter((transport) => {
    if (!searchTerm) return true;

    const searchTermLower = searchTerm.toLowerCase();

    if (searchColumn === "all") {
      return (
        transport.gardenOwner.toLowerCase().includes(searchTermLower) ||
        transport.gardenName.toLowerCase().includes(searchTermLower) ||
        transport.teaKilos.toString().includes(searchTerm) ||
        new Date(transport.transportDate)
          .toLocaleDateString()
          .includes(searchTerm)
      );
    }

    if (searchColumn === "gardenOwner") {
      return transport.gardenOwner.toLowerCase().includes(searchTermLower);
    }

    if (searchColumn === "gardenName") {
      return transport.gardenName.toLowerCase().includes(searchTermLower);
    }

    if (searchColumn === "teaKilos") {
      return transport.teaKilos.toString().includes(searchTerm);
    }

    if (searchColumn === "transportDate") {
      return new Date(transport.transportDate)
        .toLocaleDateString()
        .includes(searchTerm);
    }

    return true;
  });

  /**
   * BillDetails Component
   * Displays detailed information about a specific bill
   * @param {Object} props - Component props
   * @param {Object} props.bill - The bill object to display
   */
  const BillDetails = ({ bill }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tea Transport Bill</h2>
            <p className="text-gray-600">Bill #: {bill.billNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              Status:{" "}
              <span
                className={`${
                  bill.billStatus === "paid"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {bill.billStatus.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Transport Date:{" "}
              {new Date(bill.transportDate).toLocaleDateString()}
            </p>
            {bill.paidDate && (
              <p className="text-sm text-gray-600">
                Paid Date: {new Date(bill.transportDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700">Garden Owner</h3>
            <p>{bill.gardenOwner}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Garden Name</h3>
            <p>{bill.gardenName}</p>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="flex justify-between items-center mb-2">
            <span>Tea Quantity</span>
            <span>{bill.teaKilos} kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Price per Kg</span>
            <span>Rs. {bill.pricePerKg}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="font-bold">Total Amount</span>
          <span className="text-xl font-bold">
            Rs. {bill.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  // User guidelines content
  const userGuidelines = [
    {
      title: "Garden Owner Data Entry",
      steps: [
        "Select the garden owner from the dropdown list",
        "Enter the garden name where the tea was produced",
        "Input the quantity of tea in kilograms",
        "Select the transport date",
        "Review the automatically calculated total amount",
        "Click 'Submit' to save the entry",
      ],
    },
    {
      title: "Transport Records",
      steps: [
        "Use the search box to filter records by any field",
        "Select a specific column to search from the dropdown",
        "Click column headers to sort records",
        "Use 'Load More Records' to view additional entries",
      ],
    },
    {
      title: "Schedules",
      steps: [
        "View your assigned transport schedules",
        "Update the status of each garden visit as you complete them",
        "Mark gardens as 'Pending', 'In Progress', or 'Completed'",
      ],
    },
    {
      title: "Messages",
      steps: [
        "Compose new messages to factory managers or garden owners",
        "View your inbox and sent messages",
        "Reply to received messages as needed",
      ],
    },
    {
      title: "E-Bills",
      steps: [
        "View all generated bills for transported tea",
        "Print bills using the 'Print' button",
        "Filter bills by status or search for specific bills",
      ],
    },
    {
      title: "News Updates",
      steps: [
        "Stay updated with the latest tea industry news",
        "View best practices for tea transport",
        "Click 'Refresh News' to get the latest articles",
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Print styles for bills */}
      {/* <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style> */}
      <style>
        {`
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: white;
        padding: 20px;
      }
      .no-print {
        display: none !important;
      }
    }
  `}
      </style>

      {/* Print bill content (hidden until printing) */}
      {selectedBill && (
        <div className="print-content hidden">
          <BillDetails bill={selectedBill} />
        </div>
      )}

      {/* Main dashboard content */}
      <div className="pt-16"></div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Transport Manager Dashboard
          </h1>
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            <FaInfoCircle className="mr-2" />
            {showGuidelines ? "Hide Guidelines" : "Show Guidelines"}
          </button>
        </div>

        {/* User Guidelines Panel */}
        {showGuidelines && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              User Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGuidelines.map((section, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-blue-800 mb-2">
                    {section.title}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-blue-700">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "dashboard"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-white hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "schedules"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-white hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("schedules")}
          >
            <FaCalendarAlt className="inline mr-1" /> Schedules
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "messages"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-white hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            <FaEnvelope className="inline mr-1" /> Messages
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "bills"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-white hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("bills")}
          >
            <FaFileInvoice className="inline mr-1" /> E-Bills
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "news"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-white hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("news")}
          >
            <FaNewspaper className="inline mr-1" /> News Updates
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Garden Owner Data Entry Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Row Tea Data Entry
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Garden Owner
                  </label>
                  <select
                    name="gardenOwner"
                    value={teaData.gardenOwner}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Garden Owner</option>
                    {gardenOwners.map((owner) => (
                      <option key={owner.email} value={owner.name}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Garden Name
                  </label>
                  <input
                    type="text"
                    name="gardenName"
                    value={teaData.gardenName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tea Kilos
                  </label>
                  <input
                    type="number"
                    name="teaKilos"
                    value={teaData.teaKilos}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Date
                  </label>
                  <input
                    type="date"
                    name="transportDate"
                    value={teaData.transportDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Kg (Factory Set)
                  </label>
                  <input
                    type="text"
                    value={`Rs. ${factoryPrice || "Not set"}`}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    value={`Rs. ${totalAmount}`}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </form>

            {/* Transport Records Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Transport Records
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select
                      value={searchColumn}
                      onChange={(e) => setSearchColumn(e.target.value)}
                      className="border p-2 rounded-l bg-gray-100"
                    >
                      <option value="all">All Columns</option>
                      <option value="gardenOwner">Garden Owner</option>
                      <option value="gardenName">Garden Name</option>
                      <option value="teaKilos">Tea Kilos</option>
                      <option value="transportDate">Date</option>
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Search ${
                        searchColumn === "all" ? "all records" : searchColumn
                      }...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border p-2 pl-8 rounded-r"
                    />
                    <FaSearch className="absolute left-2 top-3 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 ml-2">
                    Showing {Math.min(filteredTransports.length, recordsToShow)}{" "}
                    of {filteredTransports.length} records
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                        onClick={() => requestSort("gardenOwner")}
                      >
                        <div className="flex items-center">
                          Garden Owner
                          {sortConfig.key === "gardenOwner" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaArrowUp className="ml-1" size={10} />
                            ) : (
                              <FaArrowDown className="ml-1" size={10} />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                        onClick={() => requestSort("gardenName")}
                      >
                        <div className="flex items-center">
                          Garden Name
                          {sortConfig.key === "gardenName" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaArrowUp className="ml-1" size={10} />
                            ) : (
                              <FaArrowDown className="ml-1" size={10} />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                        onClick={() => requestSort("teaKilos")}
                      >
                        <div className="flex items-center">
                          Tea Kilos
                          {sortConfig.key === "teaKilos" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaArrowUp className="ml-1" size={10} />
                            ) : (
                              <FaArrowDown className="ml-1" size={10} />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                        onClick={() => requestSort("transportDate")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig.key === "transportDate" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaArrowUp className="ml-1" size={10} />
                            ) : (
                              <FaArrowDown className="ml-1" size={10} />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price/Kg
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransports
                      .slice(0, recordsToShow)
                      .map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.gardenOwner}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.gardenName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.teaKilos} kg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(item.transportDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            Rs. {item.pricePerKg}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            Rs. {item.totalAmount}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {filteredTransports.length > recordsToShow && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setRecordsToShow(recordsToShow + 10)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Load More Records
                  </button>
                </div>
              )}

              <div className="mt-2 text-sm text-gray-500">
                <p>Search tips:</p>
                <ul className="list-disc pl-5">
                  <li>Select a column to search specific fields</li>
                  <li>For dates, use format: MM/DD/YYYY</li>
                  <li>For numbers (kilos), enter exact values</li>
                  <li>Leave search empty to see all records</li>
                  <li>Click column headers to sort</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === "schedules" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
              <FaCalendarAlt className="text-blue-600 mr-2" /> Your Schedules
            </h2>

            {schedulesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No schedules assigned to you
              </div>
            ) : (
              <div className="space-y-6">
                {schedules.map((schedule) => (
                  <div key={schedule._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          Schedule for:{" "}
                          {new Date(schedule.date).toLocaleDateString()}
                        </p>
                        {schedule.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Notes: {schedule.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(schedule.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">
                        Gardens to Visit:
                      </h3>
                      <div className="space-y-3">
                        {schedule.gardens.map((garden, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded border"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <div>
                                <p className="font-medium">
                                  {garden.gardenName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {garden.address}
                                </p>
                                {garden.expectedQuantity && (
                                  <p className="text-sm text-gray-600">
                                    Expected: {garden.expectedQuantity} kg
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={garden.status}
                                  onChange={(e) =>
                                    updateGardenStatus(
                                      schedule._id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="border p-1 rounded text-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="in-progress">
                                    In Progress
                                  </option>
                                  <option value="completed">Completed</option>
                                </select>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    garden.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : garden.status === "in-progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {garden.status === "completed" ? (
                                    <FaCheck className="inline mr-1" />
                                  ) : garden.status === "in-progress" ? (
                                    <FaClock className="inline mr-1" />
                                  ) : (
                                    <FaTimes className="inline mr-1" />
                                  )}
                                  {garden.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${
                  messagesTab === "inbox"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-blue-400"
                }`}
                onClick={() => setMessagesTab("inbox")}
              >
                <FaInbox className="inline mr-1" /> Inbox
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  messagesTab === "sent"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-blue-400"
                }`}
                onClick={() => setMessagesTab("sent")}
              >
                <FaPaperPlane className="inline mr-1" /> Sent
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  messagesTab === "compose"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-blue-400"
                }`}
                onClick={() => setMessagesTab("compose")}
              >
                <FaPaperPlane className="inline mr-1" /> Compose
              </button>
            </div>

            {messagesTab === "compose" && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FaPaperPlane className="mr-2" /> New Message
                </h3>
                <form onSubmit={handleSendMessage}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To:
                    </label>
                    <select
                      value={newMessage.receiverEmail}
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          receiverEmail: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Recipient</option>
                      <optgroup label="Factory Managers">
                        {recipients.factoryManagers.map((recipient) => (
                          <option key={recipient.email} value={recipient.email}>
                            {recipient.name} ({recipient.email})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Garden Owners">
                        {recipients.gardenOwners.map((recipient) => (
                          <option key={recipient.email} value={recipient.email}>
                            {recipient.name} ({recipient.email})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message:
                    </label>
                    <textarea
                      value={newMessage.message}
                      onChange={(e) =>
                        setNewMessage({
                          ...newMessage,
                          message: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                  >
                    <FaPaperPlane className="mr-2" /> Send Message
                  </button>
                </form>
              </div>
            )}

            {(messagesTab === "inbox" || messagesTab === "sent") && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  {messagesTab === "inbox" ? (
                    <FaInbox className="mr-2" />
                  ) : (
                    <FaPaperPlane className="mr-2" />
                  )}
                  {messagesTab === "inbox"
                    ? "Received Messages"
                    : "Sent Messages"}
                </h3>
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : messages.filter((m) =>
                    messagesTab === "inbox"
                      ? m.receiverEmail === userEmail
                      : m.senderEmail === userEmail
                  ).length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No {messagesTab === "inbox" ? "received" : "sent"} messages
                    found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter((m) =>
                        messagesTab === "inbox"
                          ? m.receiverEmail === userEmail
                          : m.senderEmail === userEmail
                      )
                      .map((message) => (
                        <div
                          key={message._id}
                          className={`p-4 rounded-lg border ${
                            message.receiverEmail === userEmail
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium flex items-center">
                                <FaUser className="mr-2" />
                                {message.senderEmail === userEmail
                                  ? "You"
                                  : message.senderEmail}
                              </p>
                              <p className="text-sm text-gray-500">
                                to{" "}
                                {message.receiverEmail === userEmail
                                  ? "you"
                                  : message.receiverEmail}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap mt-2">
                            {message.message}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === "bills" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                <FaFileInvoice className="text-blue-600 mr-2" /> E-Bills
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 pl-8 rounded"
                  />
                  <FaSearch className="absolute left-2 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            {bills.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No bills found</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bills
                  .filter((bill) => {
                    if (!searchTerm) return true;
                    const searchTermLower = searchTerm.toLowerCase();
                    return (
                      bill.billNumber.toString().includes(searchTerm) ||
                      bill.gardenOwner
                        .toLowerCase()
                        .includes(searchTermLower) ||
                      bill.gardenName.toLowerCase().includes(searchTermLower) ||
                      bill.teaKilos.toString().includes(searchTerm) ||
                      new Date(bill.transportDate)
                        .toLocaleDateString()
                        .includes(searchTerm)
                    );
                  })
                  .map((bill) => (
                    <div
                      key={bill._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            Bill #{bill.billNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bill.gardenName} - {bill.gardenOwner}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(bill.transportDate).toLocaleDateString()}{" "}
                            | {bill.teaKilos} kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            Rs. {bill.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm">@ Rs. {bill.pricePerKg}/kg</p>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              bill.billStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {bill.billStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center"
                        >
                          <FaPrint className="mr-1" /> Print
                        </button>
                      </div>
                      {bill.billStatus === "paid" && (
                        <p className="text-xs text-gray-500 mt-2">
                          Paid on {new Date(bill.paidDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {selectedBill && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Bill Details</h3>
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <BillDetails bill={selectedBill} />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handlePrintBill(selectedBill)}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                  >
                    <FaPrint className="mr-2" /> Print Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                <FaNewspaper className="text-blue-600 mr-2" />
                Tea Transport News & Best Practices
              </h2>
              <button
                onClick={fetchNewsArticles}
                disabled={isLoadingNews}
                className="bg-blue-500 text-white px-3 py-1 rounded flex items-center text-sm"
              >
                {isLoadingNews ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaSync className="mr-2" />
                    Refresh News
                  </>
                )}
              </button>
            </div>

            {isLoadingNews ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsArticles.map((article, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {article.content || article.summary}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            {article.source}
                          </span>
                          <span className="text-gray-400">{article.date}</span>
                        </div>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                          >
                            Read more
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800">
                    Key Recommendations for Tea Transport:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-blue-700">
                    <li>
                      Transport tea leaves within 2-4 hours of plucking to
                      prevent fermentation
                    </li>
                    <li>
                      Use breathable containers to prevent heat buildup and
                      moisture accumulation
                    </li>
                    <li>
                      Maintain temperature between 20-25°C during transport
                    </li>
                    <li>
                      Avoid direct sunlight exposure during transportation
                    </li>
                    <li>Minimize physical handling to reduce leaf damage</li>
                    <li>
                      Consider using insulated containers for long-distance
                      transport
                    </li>
                    <li>
                      Implement GPS tracking for real-time monitoring of
                      transport conditions
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportDashboard;
