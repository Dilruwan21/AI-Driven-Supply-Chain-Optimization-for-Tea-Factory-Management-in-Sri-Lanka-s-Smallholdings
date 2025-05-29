import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShare,
  FaBox,
  FaWarehouse,
  FaExclamationTriangle,
  FaRegCommentDots,
  FaHistory,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaAddressBook,
  FaPaperPlane,
  FaInbox,
  FaUser,
  FaSearch,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaClock,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaInfoCircle,
} from "react-icons/fa";
import backgroundImage from "../assets/h6.jpg";
import Chart from "react-apexcharts";
import { format, parseISO } from "date-fns";

const FactoryManagerDashboard = () => {
  // State for managing tea garden owners data
  const [teaGardenOwners, setTeaGardenOwners] = useState([]);
  // State for managing transport managers data
  const [transportManagers, setTransportManagers] = useState([]);
  // State for selected transport manager in scheduling
  const [selectedTransportManager, setSelectedTransportManager] = useState("");
  // State for schedule date with default as today
  const [scheduleDate, setScheduleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  // State for selected gardens in scheduling
  const [selectedGardens, setSelectedGardens] = useState([]);
  // State for schedule notes
  const [scheduleNotes, setScheduleNotes] = useState("");
  // State for recent schedules
  const [recentSchedules, setRecentSchedules] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);
  // State for tea transport data
  const [teaTransportData, setTeaTransportData] = useState([]);
  // Active tab state for navigation
  const [activeTab, setActiveTab] = useState("inventory");
  // State for total tea quantity
  const [totalTeaQuantity, setTotalTeaQuantity] = useState(0);
  // State for stock records
  const [stockRecords, setStockRecords] = useState([]);
  // State for wastage history
  const [wastageHistory, setWastageHistory] = useState([]);
  // State for new stock entry
  const [newStock, setNewStock] = useState({
    stockId: "",
    kgPerStock: "",
    rawTeaUsed: "",
    rawTeaTransportIds: [],
    date: new Date().toISOString().split("T")[0],
  });
  // State for distributions
  const [distributions, setDistributions] = useState([]);
  // State for contact details
  const [contactDetails, setContactDetails] = useState([]);
  // Constants for maximum capacities
  const MAX_CAPACITY = 5000;
  const MAX_STOCK_CAPACITY = 10000;
  // Navigation hook
  const navigate = useNavigate();

  // Tea Price Management State
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [priceHistory, setPriceHistory] = useState([]);

  // Message state
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState({
    transportManagers: [],
    gardenOwners: [],
    allRecipients: [],
  });
  const [newMessage, setNewMessage] = useState({
    receiverEmail: "",
    message: "",
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageTab, setMessageTab] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [guideContent, setGuideContent] = useState("");

  // Chart data states
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [bankDetails, setBankDetails] = useState({});
  const [incomeData, setIncomeData] = useState([]);

  /**
   * TeaInventoryBar component - Displays raw tea inventory status
   * @param {number} current - Current raw tea quantity
   * @param {number} max - Maximum capacity
   */
  const TeaInventoryBar = ({ current, max }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const getColor = () => {
      if (percentage < 30) return "from-green-400 to-green-600";
      if (percentage < 70) return "from-yellow-400 to-yellow-600";
      return "from-red-400 to-red-600";
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            <FaBox className="inline mr-2 text-green-600" />
            Current Raw Tea: {current.toFixed(2)} kg
          </span>
          <span className="text-sm font-medium text-gray-700">
            <FaWarehouse className="inline mr-2 text-blue-600" />
            Capacity: {max} kg
          </span>
        </div>
        <div className="relative bg-gray-200 rounded-lg h-8 overflow-hidden border-2 border-gray-300">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-gray-300 rounded-r-sm"></div>
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getColor()} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        {percentage >= 90 && (
          <div className="mt-2 flex items-center text-sm text-red-600 font-medium">
            <FaExclamationTriangle className="mr-2" />
            Warning: Approaching maximum capacity!
          </div>
        )}
      </div>
    );
  };

  /**
   * TeaStockBar component - Displays finished tea stock status
   * @param {number} current - Current tea stock quantity
   * @param {number} max - Maximum storage capacity
   */
  const TeaStockBar = ({ current, max }) => {
    const percentage = Math.min((current / max) * 100, 100);
    const getColor = () => {
      if (percentage < 30) return "from-blue-400 to-blue-600";
      if (percentage < 70) return "from-purple-400 to-purple-600";
      return "from-indigo-400 to-indigo-600";
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            <FaBox className="inline mr-2 text-blue-600" />
            Current Tea Stock: {current.toFixed(2)} kg
          </span>
          <span className="text-sm font-medium text-gray-700">
            <FaWarehouse className="inline mr-2 text-indigo-600" />
            Storage Capacity: {max} kg
          </span>
        </div>
        <div className="relative bg-gray-200 rounded-lg h-8 overflow-hidden border-2 border-gray-300">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-gray-300 rounded-r-sm"></div>
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getColor()} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        {percentage >= 90 && (
          <div className="mt-2 flex items-center text-sm text-red-600 font-medium">
            <FaExclamationTriangle className="mr-2" />
            Warning: Approaching storage capacity!
          </div>
        )}
      </div>
    );
  };

  /**
   * RawTeaUsageChart component - Displays monthly raw tea usage
   */
  const RawTeaUsageChart = () => {
    // Sample data for the chart
    const data = [
      { date: "Jan", usage: 1200 },
      { date: "Feb", usage: 1900 },
      { date: "Mar", usage: 1500 },
      { date: "Apr", usage: 1800 },
      { date: "May", usage: 2100 },
      { date: "Jun", usage: 1900 },
    ];

    const maxUsage = Math.max(...data.map((item) => item.usage));

    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaChartLine className="mr-2 text-green-600" />
            Raw Tea Usage
          </h3>
          <div className="text-xs text-gray-500 flex items-center">
            <FaInfoCircle className="mr-1" />
            Monthly consumption in kg
          </div>
        </div>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm"
                  style={{
                    height: `${(item.usage / maxUsage) * 100}%`,
                  }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">{item.date}</div>
                <div className="text-xs font-medium text-green-700">
                  {item.usage}kg
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            This chart shows the monthly raw tea consumption. Monitor trends to
            optimize production planning. January started with 1200kg and peaked
            at 2100kg in May.
          </p>
        </div>
      </div>
    );
  };

  /**
   * MonthlyCostChart component - Displays monthly payment costs
   */
  const MonthlyCostChart = () => {
    // Prepare chart data from payment history
    const data = {
      labels: paymentHistory
        .map((payment) => {
          try {
            const dateStr = payment.paymentDate || payment.transportDate;
            return dateStr ? format(new Date(dateStr), "MMM yyyy") : "N/A";
          } catch (e) {
            return "Invalid date";
          }
        })
        .filter((date, index, self) => self.indexOf(date) === index)
        .slice(-6),
      datasets: [
        {
          label: "Monthly Cost of Payments",
          data: paymentHistory
            .reduce((acc, payment) => {
              try {
                const dateStr = payment.paymentDate || payment.transportDate;
                const month = dateStr
                  ? format(new Date(dateStr), "MMM yyyy")
                  : "N/A";
                const existing = acc.find((item) => item.month === month);
                if (existing) {
                  existing.amount += payment.amount || payment.totalAmount || 0;
                } else {
                  acc.push({
                    month,
                    amount: payment.amount || payment.totalAmount || 0,
                  });
                }
                return acc;
              } catch (e) {
                return acc;
              }
            }, [])
            .sort((a, b) => new Date(a.month) - new Date(b.month))
            .slice(-6)
            .map((item) => item.amount),
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaMoneyBillWave className="mr-2 text-red-600" />
            Monthly Cost of Payments
          </h3>
          <div className="text-xs text-gray-500 flex items-center">
            <FaInfoCircle className="mr-1" />
            Monthly expenses in Rs.
          </div>
        </div>
        <div className="h-64">
          <Chart
            options={{
              chart: {
                type: "line",
                height: 350,
                toolbar: {
                  show: true,
                },
              },
              xaxis: {
                categories: data.labels,
              },
              yaxis: {
                labels: {
                  formatter: (value) =>
                    `Rs. ${value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`,
                },
              },
              tooltip: {
                y: {
                  formatter: (value) =>
                    `Rs. ${value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`,
                },
              },
            }}
            series={data.datasets}
            type="line"
            height={350}
          />
        </div>
      </div>
    );
  };

  /**
   * IncomeReportChart component - Displays monthly income from exports and local sales
   */
  const IncomeReportChart = () => {
    // Prepare chart data from income data
    const data = {
      labels: incomeData
        .map((item) => format(parseISO(`${item.month}-01`), "MMM yyyy"))
        .slice(-6),
      datasets: [
        {
          name: "Export Income",
          data: incomeData.map((item) => item.exportIncome).slice(-6),
        },
        {
          name: "Local Income",
          data: incomeData.map((item) => item.localIncome).slice(-6),
        },
      ],
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaChartBar className="mr-2 text-blue-600" />
            Income Report
          </h3>
          <div className="text-xs text-gray-500 flex items-center">
            <FaInfoCircle className="mr-1" />
            Monthly income in Rs.
          </div>
        </div>
        <div className="h-64">
          <Chart
            options={{
              chart: {
                type: "bar",
                height: 350,
                stacked: true,
                toolbar: {
                  show: true,
                },
              },
              xaxis: {
                categories: data.labels,
              },
              yaxis: {
                labels: {
                  formatter: (value) =>
                    `Rs. ${value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`,
                },
              },
              tooltip: {
                y: {
                  formatter: (value) =>
                    `Rs. ${value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`,
                },
              },
              colors: ["#8B5CF6", "#10B981"],
            }}
            series={data.datasets}
            type="bar"
            height={350}
          />
        </div>
      </div>
    );
  };

  /**
   * ProductionMetricsChart component - Displays production metrics over time
   */
  const ProductionMetricsChart = () => {
    // Prepare chart data from stock records
    const data = {
      labels: stockRecords
        .map((record) => format(parseISO(record.date), "MMM yyyy"))
        .slice(-6),
      datasets: [
        {
          name: "Tea Produced",
          data: stockRecords.map((record) => record.kgProduced || 0).slice(-6),
        },
        {
          name: "Raw Tea Used",
          data: stockRecords.map((record) => record.rawTeaUsed || 0).slice(-6),
        },
        {
          name: "Production Efficiency (%)",
          data: stockRecords
            .map((record) => {
              if (record.rawTeaUsed && record.kgProduced) {
                return (record.kgProduced / record.rawTeaUsed) * 100;
              }
              return 0;
            })
            .slice(-6),
        },
      ],
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaChartPie className="mr-2 text-purple-600" />
            Production Metrics
          </h3>
          <div className="text-xs text-gray-500 flex items-center">
            <FaInfoCircle className="mr-1" />
            Percentage distribution
          </div>
        </div>
        <div className="h-64">
          <Chart
            options={{
              chart: {
                type: "line",
                height: 350,
                toolbar: {
                  show: true,
                },
              },
              stroke: {
                width: [5, 5, 5],
                curve: "smooth",
              },
              xaxis: {
                categories: data.labels,
              },
              yaxis: [
                {
                  title: {
                    text: "Kilograms (kg)",
                  },
                },
                {
                  opposite: true,
                  title: {
                    text: "Efficiency (%)",
                  },
                },
              ],
              colors: ["#10B981", "#EF4444", "#8B5CF6"],
              tooltip: {
                y: {
                  formatter: (value) => `${value.toLocaleString()}`,
                },
              },
            }}
            series={data.datasets}
            type="line"
            height={350}
          />
        </div>
      </div>
    );
  };

  /**
   * Shows user guide content based on section
   * @param {string} section - The section to show guide for
   */
  const showGuide = (section) => {
    let content = "";
    switch (section) {
      case "inventory":
        content = `
          <strong>Inventory Dashboard Guide:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Monitor raw tea and finished stock levels in real-time</li>
            <li>View monthly consumption trends to forecast needs</li>
            <li>Check production efficiency metrics to identify improvement areas</li>
            <li>Track income and costs to maintain profitability</li>
            <li>Use the charts to visualize key performance indicators</li>
          </ul>
        `;
        break;
      case "management":
        content = `
          <strong>Production Management Guide:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Create new stock records when processing raw tea</li>
            <li>Select raw tea sources from available transports</li>
            <li>Monitor production records and wastage history</li>
            <li>Track distribution to ensure optimal stock levels</li>
            <li>Review efficiency metrics to improve processes</li>
          </ul>
        `;
        break;
      case "messages":
        content = `
          <strong>Messaging System Guide:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Communicate with transport managers and garden owners</li>
            <li>View your inbox and sent messages</li>
            <li>Select recipients from the dropdown menu</li>
            <li>Keep messages clear and concise</li>
            <li>Use for coordination and issue resolution</li>
          </ul>
        `;
        break;
      case "price-management":
        content = `
          <strong>Price Management Guide:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>View current tea price per kg</li>
            <li>Update prices when market conditions change</li>
            <li>Review price history for reference</li>
            <li>Changes affect all new transport records</li>
            <li>Consult with management before major price adjustments</li>
          </ul>
        `;
        break;
      case "schedule":
        content = `
          <strong>Transport Scheduling Guide:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Create daily transport schedules</li>
            <li>Select transport manager and gardens to cover</li>
            <li>Set expected quantities and priorities</li>
            <li>Add notes for special instructions</li>
            <li>Review recent schedules for reference</li>
          </ul>
        `;
        break;
      default:
        content = `
          <strong>Dashboard Overview:</strong>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li>Use the tabs to navigate between different sections</li>
            <li>Monitor inventory levels to prevent shortages or overstocking</li>
            <li>Manage production processes efficiently</li>
            <li>Communicate with team members through the messaging system</li>
            <li>Review reports to make data-driven decisions</li>
            <li>Click on any section's info icon for specific guidance</li>
          </ul>
        `;
    }
    setGuideContent(content);
    setShowUserGuide(true);
  };

  /**
   * Generates the next stock ID based on existing records
   * @returns {string} The next stock ID
   */
  const getNextStockId = () => {
    if (stockRecords.length === 0) return "STK-1";

    const stockNumbers = stockRecords.map((stock) => {
      const match = stock.stockId.match(/STK-(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    });

    const maxNumber = Math.max(...stockNumbers);
    return `STK-${maxNumber + 1}`;
  };

  /**
   * Fetches current tea price from API
   */
  const fetchTeaPrice = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tea-price/current"
      );
      setCurrentPrice(response.data.price);
      setLastPriceUpdate(response.data.updatedAt);
    } catch (err) {
      console.error("Failed to fetch tea price:", err);
    }
  };

  /**
   * Fetches tea price history from API
   */
  const fetchPriceHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/tea-price/history"
      );
      setPriceHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch price history:", err);
    }
  };

  /**
   * Updates tea price in the system
   */
  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice)) {
      alert("Please enter a valid price");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tea-price/update",
        {
          price: parseFloat(newPrice),
          updatedBy: userEmail,
        }
      );

      setCurrentPrice(response.data.price);
      setLastPriceUpdate(response.data.updatedAt);
      setNewPrice("");

      const historyResponse = await axios.get(
        "http://localhost:5000/api/tea-price/history"
      );
      setPriceHistory(historyResponse.data);

      alert("Tea price updated successfully!");
    } catch (err) {
      console.error("Failed to update tea price:", err);
      alert("Failed to update tea price. Please try again.");
    }
  };

  /**
   * Fetches messages for the current user
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
   * Fetches potential message recipients
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
   * Handles sending a new message
   * @param {Event} e - Form submit event
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
   * Automatically selects top tea sources based on quantity needed
   * @param {number} quantityNeeded - The amount of tea needed
   * @returns {Array} Selected transport IDs
   */
  const autoSelectTopTeaSources = (quantityNeeded) => {
    const availableTransports = [...teaTransportData]
      .filter((transport) => transport.remainingKilos > 0)
      .sort((a, b) => b.remainingKilos - a.remainingKilos);

    let remainingToSelect = quantityNeeded;
    const selectedIds = [];

    for (const transport of availableTransports) {
      if (remainingToSelect <= 0) break;

      selectedIds.push(transport._id);
      remainingToSelect -= transport.remainingKilos;
    }

    return selectedIds;
  };

  /**
   * Handles transport selection for new stock
   * @param {Event} e - Select change event
   */
  const handleTransportSelect = (e) => {
    const options = e.target.options;
    const selectedIds = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(options[i].value);
      }
    }

    const availableTea = calculateAvailableTea(selectedIds);

    setNewStock({
      ...newStock,
      rawTeaTransportIds: selectedIds,
      rawTeaUsed: availableTea > 0 ? availableTea.toFixed(2) : "",
    });
  };

  /**
   * Calculates available tea from selected transports
   * @param {Array} selectedIds - Selected transport IDs
   * @returns {number} Total available tea
   */
  const calculateAvailableTea = (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return 0;

    return teaTransportData
      .filter((transport) => selectedIds.includes(transport._id))
      .reduce((sum, transport) => sum + (transport.remainingKilos || 0), 0);
  };

  /**
   * Handles tab navigation
   * @param {string} tab - The tab to navigate to
   */
  const handleTabClick = (tab) => {
    setActiveTab(tab);

    if (tab === "payments") {
      navigate("/factory-payments");
    } else if (tab === "monthly-report") {
      navigate("/monthly-report");
    }
  };

  /**
   * Toggles garden selection for scheduling
   * @param {Object} garden - The garden to toggle
   */
  const toggleGardenSelection = (garden) => {
    setSelectedGardens((prev) => {
      const exists = prev.some((g) => g.gardenId === garden._id);
      if (exists) {
        return prev.filter((g) => g.gardenId !== garden._id);
      } else {
        return [
          ...prev,
          {
            gardenId: garden._id,
            gardenName: garden.name,
            address: garden.address,
            expectedQuantity: "",
            priority: "medium",
          },
        ];
      }
    });
  };

  /**
   * Updates expected quantity for a garden in schedule
   * @param {string} gardenId - The garden ID
   * @param {string} quantity - The expected quantity
   */
  const updateGardenQuantity = (gardenId, quantity) => {
    setSelectedGardens((prev) =>
      prev.map((garden) =>
        garden.gardenId === gardenId
          ? { ...garden, expectedQuantity: quantity }
          : garden
      )
    );
  };

  /**
   * Clears the schedule form
   */
  const clearScheduleForm = () => {
    setSelectedTransportManager("");
    setSelectedGardens([]);
    setScheduleNotes("");
    setScheduleDate(new Date().toISOString().split("T")[0]);
  };

  /**
   * Sends the transport schedule to the server
   */
  const sendSchedule = async () => {
    try {
      const manager = transportManagers.find(
        (m) => m._id === selectedTransportManager
      );
      if (!manager) {
        alert("Selected transport manager not found");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/tea-transport/schedules",
        {
          transportManagerId: selectedTransportManager,
          transportManagerEmail: manager.email,
          date: scheduleDate,
          gardens: selectedGardens.map((garden) => ({
            gardenId: garden.gardenId,
            gardenName: garden.gardenName,
            address: garden.address,
            expectedQuantity: garden.expectedQuantity || undefined,
            priority: garden.priority,
          })),
          notes: scheduleNotes,
        }
      );

      fetchRecentSchedules();
      clearScheduleForm();
      alert("Schedule sent successfully!");
    } catch (err) {
      console.error("Error sending schedule:", err);
      alert("Failed to send schedule. Please try again.");
    }
  };

  /**
   * Fetches recent transport schedules
   */
  const fetchRecentSchedules = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/tea-transport/schedules"
      );
      setRecentSchedules(response.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to fetch schedules. Please try again.");
    }
  };

  /**
   * Gets the current user's email from JWT token
   * @returns {string|null} The user's email or null if not found
   */
  const getFactoryManagerEmail = () => {
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
   * Fetches chart data for payments and income
   */
  const fetchChartData = async () => {
    try {
      const [paymentRes, incomeRes] = await Promise.all([
        axios.get("http://localhost:5000/tea-transport/payment-history"),
        axios.get("http://localhost:5000/distribution/monthly-income"),
      ]);

      setPaymentHistory(paymentRes.data);

      // Process income data
      const processedIncome = incomeRes.data
        .map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          exportIncome: item.exportIncome || 0,
          localIncome: item.localIncome || 0,
          totalIncome: (item.exportIncome || 0) + (item.localIncome || 0),
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      setIncomeData(processedIncome);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
  };

  // Get current user's email
  const userEmail = getFactoryManagerEmail();

  // Main data fetching effect
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || !userEmail.includes("@")) {
      setError("Invalid user session. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [
          ownersRes,
          managersRes,
          transportsRes,
          stockRes,
          wastageRes,
          distributionsRes,
          contactRes,
        ] = await Promise.all([
          axios.get("http://localhost:5000/factory-manager/tea-garden-owners"),
          axios.get("http://localhost:5000/factory-manager/transport-managers"),
          axios.get("http://localhost:5000/tea-transport/get-transports"),
          axios.get("http://localhost:5000/finished-tea/stock"),
          axios
            .get("http://localhost:5000/api/wastage")
            .catch(() => ({ data: [] })),
          axios.get("http://localhost:5000/distribution"),
          axios.get("http://localhost:5000/api/contact"),
        ]);

        setTeaGardenOwners(ownersRes.data);
        setTransportManagers(managersRes.data);
        setTeaTransportData(transportsRes.data);
        setStockRecords(stockRes.data);
        setWastageHistory(wastageRes.data);
        setDistributions(distributionsRes.data);
        setContactDetails(contactRes.data);

        const total = transportsRes.data.reduce(
          (sum, item) => sum + (item.remainingKilos || 0),
          0
        );
        setTotalTeaQuantity(total);
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err.response?.data || err.message);
        setError(
          err.response?.data?.error || err.message || "Failed to load data"
        );
        setLoading(false);
      }
    };

    fetchData();
    fetchChartData();
  }, []);

  // Effect for tab-specific data fetching
  useEffect(() => {
    if (activeTab === "messages" && userEmail) {
      fetchMessages();
      fetchRecipients();
    }
    if (activeTab === "price-management") {
      fetchTeaPrice();
      fetchPriceHistory();
    }
    if (activeTab === "schedule") {
      fetchRecentSchedules();
    }
    if (activeTab === "inventory") {
      setNewStock((prev) => ({
        ...prev,
        stockId: getNextStockId(),
      }));
    }
  }, [activeTab, userEmail, stockRecords]);

  // Calculate production metrics
  const totalProduced = stockRecords.reduce(
    (sum, stock) => sum + (stock.kgProduced || 0),
    0
  );
  const totalDistributed = distributions.reduce(
    (sum, d) => sum + (d.kgDistributed || 0),
    0
  );
  const currentStock = totalProduced - totalDistributed;
  const totalWastage = wastageHistory.reduce((sum, item) => sum + item.kgs, 0);

  /**
   * Adds new stock to the system
   */
  const addStock = async () => {
    try {
      let rawTeaTransportIds = [...newStock.rawTeaTransportIds];
      let rawTeaUsed = parseFloat(newStock.rawTeaUsed);

      if (rawTeaTransportIds.length === 0 && rawTeaUsed > 0) {
        rawTeaTransportIds = autoSelectTopTeaSources(rawTeaUsed);

        setNewStock((prev) => ({
          ...prev,
          rawTeaTransportIds,
        }));

        const availableTea = calculateAvailableTea(rawTeaTransportIds);
        if (availableTea < rawTeaUsed) {
          alert(
            `Not enough raw tea available after auto-selection. Available: ${availableTea.toFixed(
              2
            )} kg`
          );
          return;
        }
      }

      if (
        isNaN(newStock.kgPerStock) ||
        isNaN(rawTeaUsed) ||
        rawTeaTransportIds.length === 0 ||
        !newStock.date
      ) {
        alert("Please fill all required fields with valid values.");
        return;
      }

      if (rawTeaUsed <= 0) {
        alert("Please enter a positive amount of raw tea to use.");
        return;
      }

      const availableTea = calculateAvailableTea(rawTeaTransportIds);
      if (rawTeaUsed > availableTea) {
        alert(
          `Not enough raw tea available. Available: ${availableTea.toFixed(
            2
          )} kg`
        );
        return;
      }

      const kgPerStock = parseFloat(newStock.kgPerStock);
      const kgProduced = kgPerStock;
      const wastage = rawTeaUsed - kgProduced;

      const originalTransports = [...teaTransportData];

      let remainingToUse = rawTeaUsed;
      const updatedTransports = teaTransportData.map((transport) => {
        if (rawTeaTransportIds.includes(transport._id)) {
          const usedAmount = Math.min(transport.remainingKilos, remainingToUse);
          remainingToUse -= usedAmount;
          return {
            ...transport,
            remainingKilos: transport.remainingKilos - usedAmount,
            status:
              transport.remainingKilos - usedAmount > 0
                ? "partially_used"
                : "exhausted",
          };
        }
        return transport;
      });

      const transportUpdates = rawTeaTransportIds.map((transportId) => {
        const original = originalTransports.find((t) => t._id === transportId);
        const updated = updatedTransports.find((t) => t._id === transportId);
        const usedAmount = original.remainingKilos - updated.remainingKilos;

        return axios.post(
          "http://localhost:5000/tea-transport/remove-raw-tea",
          {
            transportId,
            kgsUsed: usedAmount,
          }
        );
      });

      const stockUpdate = axios.post(
        "http://localhost:5000/finished-tea/add-stock",
        {
          stockId: newStock.stockId.trim(),
          kgPerStock,
          quantity: 1,
          rawTeaUsed,
          date: newStock.date,
        }
      );

      const wastageUpdate =
        wastage > 0
          ? axios.post("http://localhost:5000/api/wastage", {
              kgs: wastage,
              reason: "processing_wastage",
              date: new Date().toISOString().split("T")[0],
            })
          : Promise.resolve();

      setTeaTransportData(updatedTransports);
      setTotalTeaQuantity(
        updatedTransports.reduce(
          (sum, item) => sum + (item.remainingKilos || 0),
          0
        )
      );
      setStockRecords((prev) => [
        ...prev,
        {
          stockId: newStock.stockId.trim(),
          kgPerStock,
          quantity: 1,
          kgProduced,
          rawTeaUsed,
          wastage,
          date: new Date(newStock.date).toISOString(),
          _id: `temp-${Date.now()}`,
        },
      ]);

      await Promise.all([...transportUpdates, stockUpdate, wastageUpdate]);

      const [transportsRes, wastageRes, stockRes] = await Promise.all([
        axios.get("http://localhost:5000/tea-transport/get-transports"),
        wastage > 0
          ? axios.get("http://localhost:5000/api/wastage")
          : Promise.resolve({ data: wastageHistory }),
        axios.get("http://localhost:5000/finished-tea/stock"),
      ]);

      setStockRecords(stockRes.data);
      setTeaTransportData(transportsRes.data);
      setTotalTeaQuantity(
        transportsRes.data.reduce(
          (sum, item) => sum + (item.remainingKilos || 0),
          0
        )
      );
      if (wastage > 0) {
        setWastageHistory(wastageRes.data);
      }

      setNewStock({
        stockId: getNextStockId(),
        kgPerStock: "",
        rawTeaUsed: "",
        rawTeaTransportIds: [],
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error adding stock:", err);

      try {
        const [transportsRes, stockRes] = await Promise.all([
          axios.get("http://localhost:5000/tea-transport/get-transports"),
          axios.get("http://localhost:5000/finished-tea/stock"),
        ]);

        setTeaTransportData(transportsRes.data);
        setStockRecords(stockRes.data);
        setTotalTeaQuantity(
          transportsRes.data.reduce(
            (sum, item) => sum + (item.remainingKilos || 0),
            0
          )
        );
      } catch (fetchError) {
        console.error("Error reverting state:", fetchError);
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save changes. Please try again."
      );
      alert(
        `Error: ${
          err.response?.data?.message || err.message || "Failed to add stock"
        }`
      );
    }
  };

  /**
   * Navigates to distribution page
   */
  const handleNavigateToDistribution = () => {
    navigate("/distribution");
  };

  // Filter stock records based on search term and date
  const filteredStockRecords = stockRecords.filter((record) => {
    const recordDate = new Date(record.date).toLocaleDateString();
    return (
      record.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recordDate.includes(searchDate) ||
      (searchDate && record.date.includes(searchDate))
    );
  });

  // Filter wastage records based on search term and date
  const filteredWastageRecords = wastageHistory.filter((record) => {
    const recordDate = new Date(record.date).toLocaleDateString();
    return (
      record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recordDate.includes(searchDate) ||
      (searchDate && record.date.includes(searchDate))
    );
  });

  // Loading state UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div
      className="min-h-screen bg-gray-50 pt-20"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaWarehouse className="mr-3 text-blue-600" />
            Factory Manager Dashboard
          </h1>
          {showUserGuide && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
              <button
                onClick={() => setShowUserGuide(false)}
                className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
              >
                <FaTimes />
              </button>
              <div
                className="text-sm text-blue-800"
                dangerouslySetInnerHTML={{ __html: guideContent }}
              />
            </div>
          )}
          {!showUserGuide && (
            <button
              onClick={() => showGuide("overview")}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
            >
              <FaInfoCircle className="mr-2" />
              Show User Guide
            </button>
          )}
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            "inventory",
            "management",
            "messages",
            "price-management",
            "schedule",
            "payments",
            "monthly-report",
            "contact-details",
          ].map((tab) => (
            <button
              key={tab}
              className={`whitespace-nowrap pb-4 px-1 font-medium text-sm flex items-center ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-white hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab === "inventory" && <FaBox className="inline mr-2" />}
              {tab === "management" && <FaShare className="inline mr-2" />}
              {tab === "messages" && (
                <FaRegCommentDots className="inline mr-2" />
              )}
              {tab === "price-management" && (
                <FaDollarSign className="inline mr-2" />
              )}
              {tab === "schedule" && <FaCalendarAlt className="inline mr-2" />}
              {tab === "payments" && (
                <FaMoneyBillWave className="inline mr-2" />
              )}
              {tab === "monthly-report" && (
                <FaFileAlt className="inline mr-2" />
              )}
              {tab === "contact-details" && (
                <FaAddressBook className="inline mr-2" />
              )}
              {tab.split("-").join(" ").toUpperCase()}
            </button>
          ))}
        </nav>

        {/* Inventory Tab Content */}
        {activeTab === "inventory" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaBox className="mr-2 text-green-600" />
                    Raw Tea Inventory
                  </h2>
                  <span className="text-sm text-gray-500">
                    Updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <TeaInventoryBar
                  current={totalTeaQuantity}
                  max={MAX_CAPACITY}
                />
                {totalTeaQuantity >= MAX_CAPACITY && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center">
                    <FaExclamationTriangle className="text-red-600 mr-2" />
                    <span className="text-red-700">
                      Factory storage at full capacity! Schedule transport
                      immediately.
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaBox className="mr-2 text-blue-600" />
                    Tea Stock Status
                  </h2>
                  <button
                    onClick={handleNavigateToDistribution}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Manage Distribution
                  </button>
                </div>
                <TeaStockBar current={currentStock} max={MAX_STOCK_CAPACITY} />
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Produced</p>
                    <p className="font-bold text-blue-700">
                      {totalProduced.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Distributed</p>
                    <p className="font-bold text-purple-700">
                      {totalDistributed.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="font-bold text-indigo-700">
                      {currentStock.toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MonthlyCostChart />
              <IncomeReportChart />
              <ProductionMetricsChart />
            </div>
          </div>
        )}

        {/* Production Management Tab Content */}
        {activeTab === "management" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaShare className="mr-2 text-purple-600" />
                  Create New Stock
                </h2>
                <button
                  onClick={() => showGuide("management")}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <FaInfoCircle size={18} />
                </button>
              </div>

              <div className="mb-6">
                <TeaStockBar current={currentStock} max={MAX_STOCK_CAPACITY} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock ID
                    </label>
                    <div className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                      {newStock.stockId}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KG per Stock
                      </label>
                      <input
                        type="number"
                        value={newStock.kgPerStock}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            kgPerStock: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newStock.date}
                        onChange={(e) =>
                          setNewStock({ ...newStock, date: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raw Tea Sources
                    </label>
                    <div className="relative">
                      <select
                        multiple
                        value={newStock.rawTeaTransportIds}
                        onChange={handleTransportSelect}
                        className="w-full h-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {teaTransportData.map((transport) => (
                          <option
                            key={transport._id}
                            value={transport._id}
                            className="px-2 py-1 hover:bg-blue-50 rounded"
                            disabled={transport.remainingKilos <= 0}
                          >
                            <span className="font-medium">
                              {transport.gardenName}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ({transport.remainingKilos.toFixed(2)} kg
                              remaining)
                            </span>
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raw Tea Used (kg)
                    </label>
                    <input
                      type="number"
                      value={newStock.rawTeaUsed}
                      onChange={(e) =>
                        setNewStock({ ...newStock, rawTeaUsed: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={addStock}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FaShare className="mr-2" />
                    Create Stock
                  </button>
                  <button
                    onClick={() =>
                      setNewStock({
                        stockId: getNextStockId(),
                        kgPerStock: "",
                        rawTeaUsed: "",
                        rawTeaTransportIds: [],
                        date: new Date().toISOString().split("T")[0],
                      })
                    }
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Clear Form
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Available Capacity:{" "}
                    {(MAX_CAPACITY - totalTeaQuantity).toFixed(2)} kg
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaHistory className="mr-2 text-indigo-600" />
                  Production Records
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search records..."
                      className="pl-8 pr-4 py-2 border rounded-lg text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      placeholder="Filter by date"
                      className="pl-8 pr-4 py-2 border rounded-lg text-sm"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    />
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <button
                    onClick={handleNavigateToDistribution}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    View Distribution
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            KG/Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produced
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distributed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Raw Used
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Wastage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStockRecords.map((stock, index) => {
                          const kgPerStock = stock.kgPerStock || 0;
                          const quantity = stock.quantity || 0;
                          const rawTeaUsed = stock.rawTeaUsed || 0;
                          const totalProduced = kgPerStock * quantity;
                          const wastage = rawTeaUsed - totalProduced;
                          const distributed = distributions
                            .filter((d) => d.stockId === stock._id)
                            .reduce((sum, d) => sum + d.kgDistributed, 0);

                          return (
                            <tr key={`stock-${stock._id || index}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {stock.stockId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {kgPerStock.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {totalProduced.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {distributed.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {rawTeaUsed.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {wastage.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(stock.date).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-600" />
                Wastage Records
              </h2>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search wastage records..."
                      className="pl-8 pr-4 py-2 border rounded-lg text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      placeholder="Filter by date"
                      className="pl-8 pr-4 py-2 border rounded-lg text-sm"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    />
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  Total Wastage: {totalWastage.toFixed(2)} kg
                </span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            KGs Wasted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredWastageRecords.map((record, index) => (
                          <tr key={`wastage-${record._id || index}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.kgs.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {record.reason.replace("_", " ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab Content */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <FaEnvelope className="text-blue-600 mr-2" /> Messages
              </h2>
              <button
                onClick={() => showGuide("messages")}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <FaInfoCircle size={18} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`pb-2 px-4 font-medium text-sm flex items-center ${
                  messageTab === "inbox"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setMessageTab("inbox")}
              >
                <FaInbox className="mr-2" /> Inbox
              </button>
              <button
                className={`pb-2 px-4 font-medium text-sm flex items-center ${
                  messageTab === "sent"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setMessageTab("sent")}
              >
                <FaPaperPlane className="mr-2" /> Sent
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
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
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Recipient</option>
                        <optgroup label="Transport Managers">
                          {recipients.transportManagers?.map((recipient) => (
                            <option
                              key={recipient.email}
                              value={recipient.email}
                            >
                              {recipient.name} ({recipient.email})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Garden Owners">
                          {recipients.gardenOwners?.map((recipient) => (
                            <option
                              key={recipient.email}
                              value={recipient.email}
                            >
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
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <FaPaperPlane className="mr-2" /> Send Message
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  {messageTab === "inbox" ? (
                    <>
                      <FaInbox className="mr-2" /> Inbox Messages
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" /> Sent Messages
                    </>
                  )}
                </h3>
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : messages.filter((msg) =>
                    messageTab === "inbox"
                      ? msg.receiverEmail === userEmail
                      : msg.senderEmail === userEmail
                  ).length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No messages found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages
                      .filter((msg) =>
                        messageTab === "inbox"
                          ? msg.receiverEmail === userEmail
                          : msg.senderEmail === userEmail
                      )
                      .map((message) => (
                        <div
                          key={message._id}
                          className={`p-4 rounded-lg border ${
                            message.receiverEmail === userEmail
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-gray-200"
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
            </div>
          </div>
        )}

        {/* Price Management Tab Content */}
        {activeTab === "price-management" && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FaDollarSign className="mr-2 text-green-600" />
                Raw Tea Price Management
              </h2>
              <button
                onClick={() => showGuide("price-management")}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <FaInfoCircle size={18} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">
                  Current Price
                </h3>
                <div className="text-2xl font-bold text-blue-900">
                  Rs. {currentPrice || "Not set"}
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Last updated:{" "}
                  {lastPriceUpdate
                    ? new Date(lastPriceUpdate).toLocaleString()
                    : "Never"}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-4">
                  Set New Price
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Enter price per kg"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={handleUpdatePrice}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update Price
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This price will be used for all new tea transport records.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-4">
                  Price History
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Price (Rs./kg)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Updated By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {priceHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            Rs. {item.price}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.updatedBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab Content */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FaCalendarAlt className="mr-2 text-orange-600" />
                Daily Transport Schedule
              </h2>
              <button
                onClick={() => showGuide("schedule")}
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <FaInfoCircle size={18} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Schedule</h3>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Transport Manager
                  </label>
                  <select
                    value={selectedTransportManager}
                    onChange={(e) =>
                      setSelectedTransportManager(e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Transport Manager</option>
                    {transportManagers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Gardens to Cover
                </label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {teaGardenOwners.map((garden) => (
                    <div key={garden._id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`garden-${garden._id}`}
                        checked={selectedGardens.some(
                          (g) => g.gardenId === garden._id
                        )}
                        onChange={() => toggleGardenSelection(garden)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`garden-${garden._id}`}
                        className="flex-1"
                      >
                        <span className="font-medium">{garden.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({garden.address})
                        </span>
                      </label>
                      {selectedGardens.some(
                        (g) => g.gardenId === garden._id
                      ) && (
                        <input
                          type="number"
                          placeholder="Expected kg"
                          value={
                            selectedGardens.find(
                              (g) => g.gardenId === garden._id
                            )?.expectedQuantity || ""
                          }
                          onChange={(e) =>
                            updateGardenQuantity(garden._id, e.target.value)
                          }
                          className="w-24 px-2 py-1 border rounded text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes/Instructions
                </label>
                <textarea
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Special instructions for the transport manager..."
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={clearScheduleForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
                <button
                  onClick={sendSchedule}
                  disabled={
                    !selectedTransportManager || selectedGardens.length === 0
                  }
                  className={`px-4 py-2 rounded-lg ${
                    !selectedTransportManager || selectedGardens.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Send Schedule
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Recent Schedules</h3>
              <div className="space-y-4">
                {recentSchedules.length > 0 ? (
                  recentSchedules.map((schedule) => (
                    <div key={schedule._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            To:{" "}
                            {schedule.transportManagerId?.name ||
                              "Unknown Manager"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(schedule.date).toLocaleDateString()} •
                            {schedule.gardens.length} gardens
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(schedule.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Gardens:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {schedule.gardens.map((garden, idx) => (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-gray-50 rounded"
                            >
                              <p className="font-medium">{garden.gardenName}</p>
                              <p className="text-gray-600">
                                {garden.expectedQuantity
                                  ? `${garden.expectedQuantity} kg expected`
                                  : "Quantity not specified"}
                              </p>
                              <div className="flex items-center mt-1 text-xs">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded ${
                                    garden.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : garden.status === "in-progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {garden.status === "completed" ? (
                                    <FaCheck className="mr-1" />
                                  ) : garden.status === "in-progress" ? (
                                    <FaClock className="mr-1" />
                                  ) : (
                                    <FaTimes className="mr-1" />
                                  )}
                                  {garden.status || "pending"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {schedule.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Notes:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {schedule.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No schedules sent yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab Content */}
        {activeTab === "payments" &&
          !window.location.pathname.includes("factory-payments") && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FaMoneyBillWave className="mr-2 text-green-600" />
                Payments Management
              </h2>
              <p className="text-gray-600">Redirecting to payments page...</p>
            </div>
          )}

        {/* Monthly Report Tab Content */}
        {activeTab === "monthly-report" &&
          !window.location.pathname.includes("monthly-report") && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FaFileAlt className="mr-2 text-blue-600" />
                Monthly Reports
              </h2>
              <p className="text-gray-600">
                Redirecting to monthly reports page...
              </p>
            </div>
          )}

        {/* Contact Details Tab Content */}
        {activeTab === "contact-details" && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaAddressBook className="mr-2 text-green-600" />
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Main Office</h3>
                    <p className="text-gray-600 mt-1">
                      123 Tea Plantation Road
                      <br />
                      Green Valley, TV 45678
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FaPhone className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Sales Office</h3>
                    <p className="text-gray-600 mt-1">
                      +94 112 345 678
                      <br />
                      +94 765 432 109
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FaEnvelope className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">
                      sales@whatsellertea.com
                      <br />
                      support@whatsellertea.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="font-medium text-gray-900 mb-3">
                  Recent Inquiries
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Subject
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Message
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactDetails.map((contact) => (
                        <tr key={contact._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {contact.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {contact.email}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {contact.subject}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                            {contact.message}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryManagerDashboard;
