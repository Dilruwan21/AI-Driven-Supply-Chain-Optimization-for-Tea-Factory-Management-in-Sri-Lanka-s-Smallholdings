import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/h6.jpg";
import {
  FaLeaf,
  FaChartLine,
  FaEnvelope,
  FaCloudSun,
  FaSearch,
  FaSync,
  FaMagic,
  FaPaperPlane,
  FaInbox,
  FaUser,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFileInvoice,
  FaCheck,
  FaPrint,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaHistory,
} from "react-icons/fa";
import { Chart } from "chart.js/auto";
import { motion, AnimatePresence } from "framer-motion";

// List of Sri Lankan banks for the dropdown
const SRI_LANKAN_BANKS = [
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "Commercial Bank of Ceylon",
  "Hatton National Bank (HNB)",
  "Sampath Bank",
  "National Development Bank (NDB)",
  "DFCC Bank",
  "Seylan Bank",
  "Pan Asia Bank",
  "Union Bank",
  "Amana Bank",
  "HSBC Sri Lanka",
  "Citibank Sri Lanka",
  "Standard Chartered Sri Lanka",
  "State Bank of India (Sri Lanka)",
  "ICICI Bank Sri Lanka",
  "Deutsche Bank Sri Lanka",
  "MCB Bank Sri Lanka",
  "Habib Bank Sri Lanka",
  "Nations Trust Bank",
  "Sanasa Development Bank",
  "Regional Development Bank",
  "Lanka Orix Leasing Company (LOLC)",
  "HDFC Bank Sri Lanka",
  "Public Bank Sri Lanka",
];

/**
 * PaymentDetails component - Displays payment details and bills for the garden owner
 * @param {Object} props - Component props
 * @param {string} props.user - The email/name of the logged-in user
 */
const PaymentDetails = ({ user }) => {
  // State for bills data, loading status, and errors
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false); // New state for print preview

  // State for sorting configuration
  const [sortConfig, setSortConfig] = useState({
    key: "transportDate",
    direction: "desc",
  });

  // State for column filters
  const [columnFilters, setColumnFilters] = useState({
    billNumber: "",
    transportDate: "",
    gardenName: "",
    teaKilos: "",
    totalAmount: "",
    billStatus: "",
  });

  // Fetch bills data on component mount or when user changes
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/tea-transport/get-transports`
        );

        // Validate response data format
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid response format - expected array");
        }

        // Filter bills for the current user and format data
        const userBills = response.data
          .filter((bill) => {
            const matchesEmail =
              bill.gardenOwnerEmail?.toLowerCase() === user.toLowerCase();
            const matchesName =
              bill.gardenOwner?.toLowerCase() === user.toLowerCase();
            return matchesEmail || matchesName;
          })
          .map((bill) => ({
            ...bill,
            billNumber: bill.billNumber || `TEMP-${bill._id}`,
            billStatus: bill.billStatus || "pending",
            totalAmount:
              bill.totalAmount || bill.teaKilos * bill.pricePerKg || 0,
          }));

        setBills(userBills);
        setError(null);
      } catch (err) {
        console.error("[PaymentDetails] Failed to fetch bills:", err);
        setError(`Failed to load payment details: ${err.message}`);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBills();
    }
  }, [user]);

  /**
   * Handle sorting request for a column
   * @param {string} key - The column key to sort by
   */
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /**
   * Get class names for sort indicators
   * @param {string} name - The column name
   * @returns {string|undefined} - The sort direction class or undefined
   */
  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  // Memoized sorted bills based on sort configuration
  const sortedBills = React.useMemo(() => {
    let sortableBills = [...bills];
    if (sortConfig !== null) {
      sortableBills.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBills;
  }, [bills, sortConfig]);

  // Filter bills based on search term and column filters
  const filteredBills = sortedBills.filter((bill) => {
    // Global search
    if (
      searchTerm &&
      !Object.values(bill).some(
        (val) =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }

    // Column filters
    for (const [key, value] of Object.entries(columnFilters)) {
      if (
        value &&
        bill[key] &&
        !bill[key].toString().toLowerCase().includes(value.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });

  /**
   * Handle column filter changes
   * @param {string} columnName - The column name to filter
   * @param {string} value - The filter value
   */
  const handleColumnFilterChange = (columnName, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  // Loading state UI
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading payment details...</p>
      </motion.div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-red-500"
      >
        <FaExclamationTriangle className="mx-auto text-2xl" />
        <p className="mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <FaSync /> Retry
        </button>
      </motion.div>
    );
  }

  // No data state UI
  if (bills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-gray-500"
      >
        <FaInbox className="mx-auto text-3xl mb-2" />
        <p>No payment records found</p>
        <p className="text-sm mt-2">User: {user}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Print styles for bill printing */}
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
              padding: 20px;
              background: white;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>

      {/* Print Preview Modal */}
      {showPrintPreview && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Print Preview</h3>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="print-content bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Tea Transport Bill</h2>
                  <p className="text-gray-600">
                    Bill #: {selectedBill.billNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Status:{" "}
                    <span
                      className={`${
                        selectedBill.billStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedBill.billStatus.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date:{" "}
                    {new Date(selectedBill.transportDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700">Garden Owner</h3>
                  <p>{selectedBill.gardenOwner}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Garden Name</h3>
                  <p>{selectedBill.gardenName}</p>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Tea Quantity</span>
                  <span>{selectedBill.teaKilos} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Price per Kg</span>
                  <span>Rs. {selectedBill.pricePerKg}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-bold">
                  Rs. {selectedBill.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4 no-print">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTimeout(() => {
                    window.print();
                    setShowPrintPreview(false);
                  }, 200);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <FaPrint /> Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 mt-1" />
          <div>
            <h3 className="font-medium text-blue-800">Payment Information</h3>
            <p className="text-sm text-blue-700">
              Here you can view all your payment bills and transaction history.
              Click on any bill to view detailed information or print it for
              your records. You can search bills using the search box below or
              filter by specific columns.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <FaFileInvoice /> Total Bills
            </h3>
            <p className="text-2xl font-semibold mt-2 text-blue-700">
              {bills.length}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-green-600 flex items-center gap-2">
              <FaMoneyBillWave /> Total Pending
            </h3>
            <p className="text-2xl font-semibold mt-2 text-green-700">
              Rs.{" "}
              {bills
                .filter((b) => b.billStatus === "pending")
                .reduce((sum, bill) => sum + bill.totalAmount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <FaCheck /> Total Paid
            </h3>
            <p className="text-2xl font-semibold mt-2 text-purple-700">
              Rs.{" "}
              {bills
                .filter((b) => b.billStatus === "paid")
                .reduce((sum, bill) => sum + bill.totalAmount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bills table */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search all bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border p-2 pl-8 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <FaSearch className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredBills.length} of {bills.length} bills
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Bill #</span>
                    <button
                      onClick={() => requestSort("billNumber")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("billNumber") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={columnFilters.billNumber}
                    onChange={(e) =>
                      handleColumnFilterChange("billNumber", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <button
                      onClick={() => requestSort("transportDate")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("transportDate") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={columnFilters.transportDate}
                    onChange={(e) =>
                      handleColumnFilterChange("transportDate", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Garden</span>
                    <button
                      onClick={() => requestSort("gardenName")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("gardenName") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={columnFilters.gardenName}
                    onChange={(e) =>
                      handleColumnFilterChange("gardenName", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Quantity</span>
                    <button
                      onClick={() => requestSort("teaKilos")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("teaKilos") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={columnFilters.teaKilos}
                    onChange={(e) =>
                      handleColumnFilterChange("teaKilos", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <button
                      onClick={() => requestSort("totalAmount")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("totalAmount") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={columnFilters.totalAmount}
                    onChange={(e) =>
                      handleColumnFilterChange("totalAmount", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <button
                      onClick={() => requestSort("billStatus")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {getClassNamesFor("billStatus") === "asc" ? (
                        <FaChevronUp size={12} />
                      ) : (
                        <FaChevronDown size={12} />
                      )}
                    </button>
                  </div>
                  <select
                    value={columnFilters.billStatus}
                    onChange={(e) =>
                      handleColumnFilterChange("billStatus", e.target.value)
                    }
                    className="mt-1 w-full p-1 text-xs border rounded"
                  >
                    <option value="">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.slice(0, 10).map((bill) => (
                <motion.tr
                  key={bill._id}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.transportDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.gardenName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.teaKilos} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs. {bill.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        bill.billStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bill.billStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowPrintPreview(true);
                      }}
                      className="text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <FaPrint className="mr-1" /> Print
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill details modal */}
      {selectedBill && !showPrintPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mt-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">Bill Details</h3>
              <p className="text-gray-500">
                {selectedBill.billNumber} - {selectedBill.gardenName}
              </p>
            </div>
            <button
              onClick={() => setSelectedBill(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Garden Owner
              </h4>
              <p className="text-lg">{selectedBill.gardenOwner}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Transport Date
              </h4>
              <p className="text-lg">
                {new Date(selectedBill.transportDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Tea Quantity
              </h4>
              <p className="text-lg">{selectedBill.teaKilos} kg</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Price per Kg
              </h4>
              <p className="text-lg">Rs. {selectedBill.pricePerKg}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total Amount</span>
              <span className="text-xl font-bold">
                Rs. {selectedBill.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => setSelectedBill(null)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={() => {
                setSelectedBill(selectedBill);
                setShowPrintPreview(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <FaPrint /> Print Bill
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Main Tea Garden Owner Dashboard component
 * @param {Object} props - Component props
 * @param {string} props.user - The email/name of the logged-in user
 */
const TeaGardenOwnerDashboard = ({ user }) => {
  const navigate = useNavigate();

  // Refs for chart elements
  const productionChartRef = useRef(null);
  const incomeChartRef = useRef(null);

  // State for tea data, loading, and errors
  const [teaData, setTeaData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for current tea price
  const [currentTeaPrice, setCurrentTeaPrice] = useState(null);
  const [teaPriceLoading, setTeaPriceLoading] = useState(true);
  const [teaPriceError, setTeaPriceError] = useState(null);

  // State for prediction data
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [isRunningModel, setIsRunningModel] = useState(false);
  const [modelRunError, setModelRunError] = useState("");

  // State for active tab
  const [activeTab, setActiveTab] = useState("teaData");

  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    date: "",
    gardenName: "",
    teaKilos: "",
    totalEarned: "",
  });

  // State for chart instances
  const [productionChartInstance, setProductionChartInstance] = useState(null);
  const [incomeChartInstance, setIncomeChartInstance] = useState(null);

  // State for garden colors
  const [gardenColors, setGardenColors] = useState({});

  // State for user guide visibility
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Message state
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState({
    factoryManagers: [],
    transportManagers: [],
    allRecipients: [],
  });
  const [newMessage, setNewMessage] = useState({
    receiverEmail: "",
    message: "",
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageFilter, setMessageFilter] = useState("all");
  const [messageError, setMessageError] = useState(null);

  // Account details state
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    beneficiaryName: "",
    branch: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [accountDetailsLoading, setAccountDetailsLoading] = useState(false);
  const [accountDetailsError, setAccountDetailsError] = useState(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [existingDetails, setExistingDetails] = useState(null);

  // Filtered banks based on search term
  const filteredBanks = SRI_LANKAN_BANKS.filter((bank) =>
    bank.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  // Fetch current tea price
  useEffect(() => {
    const fetchCurrentTeaPrice = async () => {
      try {
        setTeaPriceLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/tea-price/current"
        );
        setCurrentTeaPrice(response.data.price);
        setTeaPriceError(null);
      } catch (err) {
        console.error("Failed to fetch tea price:", err);
        setTeaPriceError("Failed to load current tea price");
      } finally {
        setTeaPriceLoading(false);
      }
    };

    fetchCurrentTeaPrice();

    // Set up polling to check for price updates every 30 seconds
    const pricePollingInterval = setInterval(fetchCurrentTeaPrice, 30000);

    return () => clearInterval(pricePollingInterval);
  }, []);

  /**
   * Generate consistent colors for gardens
   * @param {Array} gardenNames - Array of garden names
   * @returns {Object} - Color map for gardens
   */
  const generateGardenColors = (gardenNames) => {
    const colors = [
      "#4e73df",
      "#1cc88a",
      "#36b9cc",
      "#f6c23e",
      "#e74a3b",
      "#5a5c69",
      "#858796",
      "#3a3b45",
      "#6f42c1",
      "#20c997",
    ];

    const colorMap = {};
    gardenNames.forEach((garden, index) => {
      colorMap[garden] = colors[index % colors.length];
    });

    return colorMap;
  };

  /**
   * Fetch account details for the current user
   */
  const fetchAccountDetails = async () => {
    try {
      setAccountDetailsLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/account-details/${user}`
      );

      if (response.data && Object.keys(response.data).length === 0) {
        setAccountDetails({
          bankName: "",
          accountNumber: "",
          beneficiaryName: "",
          branch: "",
        });
        setExistingDetails(null);
      } else if (response.data) {
        setExistingDetails(response.data);
        setAccountDetails(response.data);
      }

      setAccountDetailsError(null);
    } catch (err) {
      console.error("Failed to fetch account details:", err);
      setAccountDetailsError("Failed to load account details");
    } finally {
      setAccountDetailsLoading(false);
    }
  };

  /**
   * Save account details to the server
   */
  const saveAccountDetails = async () => {
    try {
      setAccountDetailsLoading(true);
      const response = await axios.post(
        `http://localhost:5000/api/account-details`,
        {
          ...accountDetails,
          email: user,
        }
      );

      setExistingDetails(response.data);
      setIsEditing(false);
      setAccountDetailsError(null);
      alert("Account details saved successfully!");
    } catch (err) {
      console.error("Failed to save account details:", err);
      setAccountDetailsError("Failed to save account details");
    } finally {
      setAccountDetailsLoading(false);
    }
  };

  /**
   * Delete account details from the server
   */
  const deleteAccountDetails = async () => {
    if (
      window.confirm("Are you sure you want to delete your account details?")
    ) {
      try {
        setAccountDetailsLoading(true);
        await axios.delete(`http://localhost:5000/api/account-details/${user}`);
        setExistingDetails(null);
        setAccountDetails({
          bankName: "",
          accountNumber: "",
          beneficiaryName: "",
          branch: "",
        });
        setAccountDetailsError(null);
        alert("Account details deleted successfully!");
      } catch (err) {
        console.error("Failed to delete account details:", err);
        setAccountDetailsError("Failed to delete account details");
      } finally {
        setAccountDetailsLoading(false);
      }
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [teaResponse] = await Promise.all([
          axios.get(
            `http://localhost:5000/tea-transport/get-transports/${user}`
          ),
        ]);
        const sortedData = teaResponse.data.sort(
          (a, b) => new Date(b.transportDate) - new Date(a.transportDate)
        );
        setTeaData(sortedData);

        // Generate colors for gardens
        const gardenNames = [
          ...new Set(sortedData.map((item) => item.gardenName)),
        ];
        setGardenColors(generateGardenColors(gardenNames));

        setLoading(false);
      } catch (err) {
        console.error("Initial data error:", err);
        setError("Failed to load initial data");
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
      fetchPrediction();
      fetchAccountDetails();
    }
  }, [user]);

  // Fetch messages when messages tab is active
  useEffect(() => {
    if (activeTab === "messages" && user) {
      fetchMessages();
      fetchRecipients();
    }
  }, [activeTab, user]);

  /**
   * Render production trend chart
   */
  const renderProductionTrendChart = () => {
    if (!productionChartRef.current) {
      console.warn("Production chart canvas not available");
      return;
    }

    try {
      const ctx = productionChartRef.current.getContext("2d");

      if (productionChartInstance) {
        productionChartInstance.destroy();
      }

      const dates = [
        ...new Set(
          teaData.map((item) =>
            new Date(item.transportDate).toLocaleDateString()
          )
        ),
      ].sort((a, b) => new Date(a) - new Date(b));

      const gardenNames = [...new Set(teaData.map((item) => item.gardenName))];

      const datasets = gardenNames.map((garden) => {
        const gardenData = teaData.filter((item) => item.gardenName === garden);
        return {
          label: garden,
          data: dates.map((date) => {
            const item = gardenData.find(
              (d) => new Date(d.transportDate).toLocaleDateString() === date
            );
            return item ? item.teaKilos : 0;
          }),
          borderColor: gardenColors[garden] || getRandomColor(),
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        };
      });

      const newChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Tea Production Trend",
              font: {
                size: 16,
              },
            },
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw} kg`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Tea Production (kg)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
        },
      });

      setProductionChartInstance(newChartInstance);
    } catch (err) {
      console.error("Failed to render production chart:", err);
    }
  };

  /**
   * Render income trend chart
   */
  const renderIncomeTrendChart = () => {
    if (!incomeChartRef.current) {
      console.warn("Income chart canvas not available");
      return;
    }

    try {
      const ctx = incomeChartRef.current.getContext("2d");

      if (incomeChartInstance) {
        incomeChartInstance.destroy();
      }

      const dates = [
        ...new Set(
          teaData.map((item) =>
            new Date(item.transportDate).toLocaleDateString()
          )
        ),
      ].sort((a, b) => new Date(a) - new Date(b));

      const gardenNames = [...new Set(teaData.map((item) => item.gardenName))];

      const datasets = gardenNames.map((garden) => {
        const gardenData = teaData.filter((item) => item.gardenName === garden);
        return {
          label: garden,
          data: dates.map((date) => {
            const item = gardenData.find(
              (d) => new Date(d.transportDate).toLocaleDateString() === date
            );
            return item ? item.totalAmount : 0;
          }),
          borderColor: gardenColors[garden] || getRandomColor(),
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        };
      });

      const newChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Income Trend",
              font: {
                size: 16,
              },
            },
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${
                    context.dataset.label
                  }: Rs. ${context.raw.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Income (Rs.)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
        },
      });

      setIncomeChartInstance(newChartInstance);
    } catch (err) {
      console.error("Failed to render income chart:", err);
    }
  };

  // Render charts when tea data changes
  useEffect(() => {
    if (
      activeTab === "teaData" &&
      teaData.length > 0 &&
      productionChartRef.current
    ) {
      renderProductionTrendChart();
      renderIncomeTrendChart();
    }

    return () => {
      if (productionChartInstance) {
        productionChartInstance.destroy();
      }
      if (incomeChartInstance) {
        incomeChartInstance.destroy();
      }
    };
  }, [activeTab, teaData, gardenColors]);

  /**
   * Get a random color for charts
   * @returns {string} - Random color hex code
   */
  const getRandomColor = () => {
    const colors = [
      "#4e73df",
      "#1cc88a",
      "#36b9cc",
      "#f6c23e",
      "#e74a3b",
      "#5a5c69",
      "#858796",
      "#3a3b45",
      "#f8f9fc",
      "#5a5c69",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  /**
   * Fetch prediction data for the user
   */
  const fetchPrediction = async () => {
    try {
      setPredictionLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/predictions/${user}`,
        { timeout: 10000 }
      );
      setPrediction(response.data.data || response.data);
      setPredictionError("");
    } catch (err) {
      console.error("Prediction fetch error:", err);
      setPredictionError("Failed to load predictions");
      setPrediction(null);
    } finally {
      setPredictionLoading(false);
    }
  };

  /**
   * Run prediction model to generate new forecasts
   */
  const runPredictionModel = async () => {
    try {
      setIsRunningModel(true);
      setModelRunError("");

      const response = await axios.post(
        `http://localhost:5000/api/predictions/run-model/${user}`,
        {},
        { timeout: 150000 }
      );

      if (response.data.success) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await fetchPrediction();
        alert("Predictions successfully updated!");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setModelRunError(err.message);
    } finally {
      setIsRunningModel(false);
    }
  };

  /**
   * Fetch messages for the current user
   */
  const fetchMessages = async () => {
    setMessagesLoading(true);
    setMessageError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${user}`,
        {
          params: {
            timestamp: Date.now(),
          },
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      setMessages(response.data);
    } catch (err) {
      console.error("Message fetch error:", err);
      setMessageError("Failed to load messages. Please try again.");
    } finally {
      setMessagesLoading(false);
    }
  };

  /**
   * Fetch recipients for messages
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
   * Handle sending a new message
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/messages/send", {
        ...newMessage,
        senderEmail: user,
      });

      await fetchMessages();
      setNewMessage({ receiverEmail: "", message: "" });
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Message send error:", err);
      alert("Failed to send message");
    }
  };

  /**
   * Handle search filter changes
   * @param {string} filterName - The name of the filter
   * @param {string} value - The new filter value
   */
  const handleSearchFilterChange = (filterName, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Filter tea data based on search filters
  const filteredTeaData = teaData.filter((item) => {
    if (
      searchFilters.date &&
      !new Date(item.transportDate)
        .toLocaleDateString()
        .includes(searchFilters.date)
    ) {
      return false;
    }

    if (
      searchFilters.gardenName &&
      !item.gardenName
        .toLowerCase()
        .includes(searchFilters.gardenName.toLowerCase())
    ) {
      return false;
    }

    if (
      searchFilters.teaKilos &&
      !item.teaKilos.toString().includes(searchFilters.teaKilos)
    ) {
      return false;
    }

    if (
      searchFilters.totalEarned &&
      !item.totalAmount.toString().includes(searchFilters.totalEarned)
    ) {
      return false;
    }

    return true;
  });

  // Filter messages based on message filter
  //   const filteredMessages = messages.filter((message) => {
  //     if (messageFilter === "all") return true;
  //     if (messageFilter === "sent") return message.senderEmail === user;
  //     if (messageFilter === "received") return message.receiverEmail === user;
  //     return true;
  //   });
  const filteredMessages = messages.filter((message) => {
    if (messageFilter === "all") return true;
    if (messageFilter === "sent")
      return message.senderEmail?.toLowerCase() === user.toLowerCase();
    if (messageFilter === "received")
      return message.receiverEmail?.toLowerCase() === user.toLowerCase();
    return true;
  });

  /**
   * MessageList component - Displays filtered messages
   */
  const MessageList = () => {
    if (messagesLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading messages...</p>
        </motion.div>
      );
    }

    if (messageError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-red-500"
        >
          <FaExclamationTriangle className="mx-auto text-2xl" />
          <p className="mt-2">{messageError}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaSync /> Retry
          </button>
        </motion.div>
      );
    }

    if (filteredMessages.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          <FaInbox className="mx-auto text-3xl mb-2" />
          <p>No messages found</p>
          {messageFilter !== "all" && (
            <button
              onClick={() => setMessageFilter("all")}
              className="mt-4 text-blue-500 hover:underline"
            >
              Show all messages
            </button>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {filteredMessages.map((message) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg border ${
              message.receiverEmail === user
                ? "bg-blue-50 border-blue-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <FaUser />
                  {message.senderEmail === user ? "You" : message.senderEmail}
                </p>
                <p className="text-sm text-gray-500">
                  {message.senderEmail === user
                    ? `to ${message.receiverEmail}`
                    : `to you`}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mt-2">
              {message.message}
            </p>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  /**
   * AccountDetailsForm component - Displays and manages account details
   */
  const AccountDetailsForm = () => {
    if (accountDetailsLoading && !isEditing) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading account details...</p>
        </motion.div>
      );
    }

    if (accountDetailsError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-red-500"
        >
          <FaExclamationTriangle className="mx-auto text-2xl" />
          <p className="mt-2">{accountDetailsError}</p>
          <button
            onClick={fetchAccountDetails}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaSync /> Retry
          </button>
        </motion.div>
      );
    }

    if (!isEditing && existingDetails) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FaInbox className="text-blue-500" /> Your Bank Account Details
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={deleteAccountDetails}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Bank Name
              </h4>
              <p className="text-lg">{existingDetails.bankName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Account Number
              </h4>
              <p className="text-lg">{existingDetails.accountNumber}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Beneficiary Name
              </h4>
              <p className="text-lg">{existingDetails.beneficiaryName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Branch</h4>
              <p className="text-lg">{existingDetails.branch}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaInbox className="text-blue-500" />
            {existingDetails
              ? "Update Bank Account Details"
              : "Add Bank Account Details"}
          </h3>
          {existingDetails && (
            <button
              onClick={() => {
                setIsEditing(false);
                setAccountDetails(existingDetails);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAccountDetails();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                value={accountDetails.bankName}
                onChange={(e) => {
                  const value = e.target.value;
                  setAccountDetails({
                    ...accountDetails,
                    bankName: value,
                  });
                  setBankSearchTerm(value);
                  setShowBankDropdown(value.length > 0);
                }}
                onFocus={() => setShowBankDropdown(true)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {showBankDropdown && filteredBanks.length > 0 && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {filteredBanks.map((bank) => (
                    <div
                      key={bank}
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setAccountDetails({
                          ...accountDetails,
                          bankName: bank,
                        });
                        setBankSearchTerm("");
                        setShowBankDropdown(false);
                        document.getElementById("bankNameInput").focus();
                      }}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                value={accountDetails.accountNumber || ""}
                onChange={(e) =>
                  setAccountDetails({
                    ...accountDetails,
                    accountNumber: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary Name *
              </label>
              <input
                type="text"
                value={accountDetails.beneficiaryName || ""}
                onChange={(e) =>
                  setAccountDetails({
                    ...accountDetails,
                    beneficiaryName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <input
                type="text"
                value={accountDetails.branch || ""}
                onChange={(e) =>
                  setAccountDetails({
                    ...accountDetails,
                    branch: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {existingDetails && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAccountDetails(existingDetails);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={accountDetailsLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:bg-blue-300"
            >
              {accountDetailsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Details
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  /**
   * UserGuide component - Displays user guide modal
   */
  const UserGuide = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl z-50 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Dashboard User Guide</h2>
            <button
              onClick={() => setShowUserGuide(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FaLeaf /> Tea Data Tab
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>View your tea production and income trends in charts</li>
                <li>
                  Filter your records by date, garden name, quantity, or
                  earnings
                </li>
                <li>See your most recent tea transport records in the table</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FaChartLine /> Predictions Tab
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  View AI-powered forecasts of your future production and
                  earnings
                </li>
                <li>Run new predictions when you have new data</li>
                <li>See the confidence level of each prediction</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FaEnvelope /> Messages Tab
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Send messages to factory or transport managers</li>
                <li>View your sent and received messages</li>
                <li>Filter messages by type (all, sent, received)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FaMoneyBillWave /> Payment Details Tab
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>View all your payment bills and transaction history</li>
                <li>Search and filter bills by various criteria</li>
                <li>View detailed bill information and print bills</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FaUser /> Account Details Tab
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Add or update your bank account details for payments</li>
                <li>Select your bank from a dropdown list</li>
                <li>Edit or delete your account details as needed</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
            className="mb-4"
          >
            <FaLeaf className="text-green-500 text-4xl mx-auto" />
          </motion.div>
          <p className="text-lg text-gray-700">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaSync /> Refresh
          </button>
        </motion.div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pt-16"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 bg-white bg-opacity-90 rounded-lg mx-4 my-4"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome, {user}!
            </h1>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                <FaLeaf className="text-green-500" /> Tea Production Dashboard
              </h2>
              {teaPriceLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
              ) : teaPriceError ? (
                <span className="text-red-500 text-sm">Price unavailable</span>
              ) : (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Current Row Tea Price: Rs.{" "}
                  {currentTeaPrice?.toFixed(2) || "N/A"}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowUserGuide(!showUserGuide)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <FaQuestionCircle /> User Guide
          </button>
        </div>

        {showUserGuide && <UserGuide />}

        {/* Dashboard tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("teaData")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "teaData"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaLeaf /> Tea Data
          </button>
          <button
            onClick={() => setActiveTab("prediction")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "prediction"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaChartLine /> Predictions
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "messages"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaEnvelope /> Messages
          </button>
          <button
            onClick={() => navigate("/weather")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              window.location.pathname === "/weather"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaCloudSun /> Weather Data
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "payments"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaMoneyBillWave /> Payment Details
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`py-2 px-4 font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "account"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            <FaUser /> Account Details
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* Tea Data Tab */}
          {activeTab === "teaData" && (
            <motion.div
              key="teaData"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FaLeaf className="text-green-500" /> Tea Production Trend
                    </h3>
                    <div
                      className="tooltip"
                      data-tip="Shows tea production in kg over time"
                    >
                      <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <FaQuestionCircle className="text-blue-500 mt-1" />
                      <p className="text-sm text-blue-700">
                        This chart shows your tea production trends over time.
                        Each line represents a different garden. Hover over
                        points to see details.
                      </p>
                    </div>
                  </div>
                  <div
                    className="chart-container"
                    style={{ position: "relative", height: "400px" }}
                  >
                    <canvas
                      ref={productionChartRef}
                      id="productionTrendChart"
                    ></canvas>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <FaMoneyBillWave className="text-blue-500" /> Income Trend
                    </h3>
                    <div
                      className="tooltip"
                      data-tip="Shows income in Rs. from each garden over time"
                    >
                      <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <FaQuestionCircle className="text-blue-500 mt-1" />
                      <p className="text-sm text-blue-700">
                        This chart shows your income trends. The colors match
                        the production chart for easy comparison between
                        production and income.
                      </p>
                    </div>
                  </div>
                  <div
                    className="chart-container"
                    style={{ position: "relative", height: "400px" }}
                  >
                    <canvas ref={incomeChartRef} id="incomeTrendChart"></canvas>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaFilter className="text-blue-500" />
                  <h3 className="font-medium">Filter Your Records</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by date (DD/MM/YYYY)..."
                      value={searchFilters.date}
                      onChange={(e) =>
                        handleSearchFilterChange("date", e.target.value)
                      }
                      className="w-full border p-2 pl-8 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <FaSearch className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by garden..."
                      value={searchFilters.gardenName}
                      onChange={(e) =>
                        handleSearchFilterChange("gardenName", e.target.value)
                      }
                      className="w-full border p-2 pl-8 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <FaSearch className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by kilos..."
                      value={searchFilters.teaKilos}
                      onChange={(e) =>
                        handleSearchFilterChange("teaKilos", e.target.value)
                      }
                      className="w-full border p-2 pl-8 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <FaSearch className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by earnings..."
                      value={searchFilters.totalEarned}
                      onChange={(e) =>
                        handleSearchFilterChange("totalEarned", e.target.value)
                      }
                      className="w-full border p-2 pl-8 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <FaSearch className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-medium flex items-center gap-2">
                    <FaHistory className="text-blue-500" /> Recent Tea Transport
                    Records
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Below are your most recent tea transport records. Use
                    filters above to find specific entries.
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Garden Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tea Kilos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Earned
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeaData.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No tea transport data found
                          </td>
                        </tr>
                      ) : (
                        filteredTeaData.slice(0, 10).map((item) => (
                          <motion.tr
                            key={item._id}
                            className="hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.transportDate
                                ? new Date(
                                    item.transportDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.gardenName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.teaKilos?.toLocaleString() || "0"} kg
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Rs. {item.totalAmount?.toLocaleString() || "0"}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictions Tab */}
          {activeTab === "prediction" && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                      <FaChartLine className="text-blue-500" /> Production
                      Predictions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      AI-powered forecasts based on your historical data of
                      recent months.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={runPredictionModel}
                      disabled={isRunningModel || predictionLoading}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        isRunningModel || predictionLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <FaMagic />{" "}
                      {isRunningModel ? "Generating..." : "Run New Prediction"}
                    </button>
                    <button
                      onClick={fetchPrediction}
                      disabled={predictionLoading}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        predictionLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <FaSync /> Refresh
                    </button>
                  </div>
                </div>

                {modelRunError && (
                  <div className="bg-red-100 p-3 rounded-lg text-red-700 mb-4 animate-pulse">
                    Error: {modelRunError}
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue-800">
                        About Predictions
                      </h3>
                      <p className="text-sm text-blue-700">
                        Our prediction model analyzes your historical production
                        data, seasonal patterns to estimate future production
                        and earnings. Predictions become more accurate as you
                        gave more row tea leaves over time.
                      </p>
                    </div>
                  </div>
                </div>

                {predictionError ? (
                  <div className="bg-yellow-50 p-4 rounded text-yellow-800">
                    {predictionError}
                  </div>
                ) : predictionLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center p-8 gap-3"
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="rounded-full h-8 w-8 border-b-2 border-blue-500"
                    ></motion.div>
                    <span>Loading predictions...</span>
                  </motion.div>
                ) : prediction ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="p-4 bg-blue-50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-sm font-medium text-blue-600 flex items-center gap-2">
                          <FaLeaf />
                          Your Expected Tea Production For Next Month
                        </h3>
                        <p className="text-2xl font-semibold mt-2 text-blue-700 animate-count-up">
                          {(prediction.production ?? 0).toLocaleString()} kg
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-green-50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <FaChartLine />
                          Your Expected Earnings For Next Month
                        </h3>
                        <p className="text-2xl font-semibold mt-2 text-green-700 animate-count-up">
                          Rs. {(prediction.earnings ?? 0).toLocaleString()}
                        </p>
                      </motion.div>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          prediction.confidence === "High"
                            ? "bg-green-100 text-green-800 animate-pulse"
                            : prediction.confidence === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prediction.confidence || "Unknown"} Confidence
                      </span>
                      <span>For {prediction.month || "next month"}</span>
                      <span>
                        Based on {prediction.history_months || 0} recent tea
                        records
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded text-gray-600">
                    No prediction data available. Click "Run New Prediction" to
                    generate forecasts.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" /> Messages
              </h2>

              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FaPaperPlane /> New Message
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
                      <optgroup label="Factory Managers">
                        {recipients.factoryManagers?.map((recipient) => (
                          <option key={recipient.email} value={recipient.email}>
                            {recipient.name} ({recipient.email})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Transport Managers">
                        {recipients.transportManagers?.map((recipient) => (
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
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <FaPaperPlane /> Send Message
                  </button>
                </form>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FaInbox /> Your Messages
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMessageFilter("all")}
                      className={`px-3 py-1 rounded ${
                        messageFilter === "all"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMessageFilter("received")}
                      className={`px-3 py-1 rounded ${
                        messageFilter === "received"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Received
                    </button>
                    <button
                      onClick={() => setMessageFilter("sent")}
                      className={`px-3 py-1 rounded ${
                        messageFilter === "sent"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Sent
                    </button>
                  </div>
                </div>

                <MessageList />
              </div>
            </motion.div>
          )}

          {/* Payment Details Tab */}
          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentDetails user={user} />
            </motion.div>
          )}

          {/* Account Details Tab */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Account Management
                </h2>
                <p className="text-gray-500 mt-1">
                  Update your bank account details for payments
                </p>
              </div>

              <AccountDetailsForm />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model running overlay */}
        {isRunningModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="rounded-full h-8 w-8 border-b-2 border-blue-500"
                ></motion.div>
                <div>
                  <p className="text-lg font-medium">
                    Generating new predictions...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Our AI is analyzing your historical data and seasonal
                    patterns. This may take up to 1 minute. Please don't close
                    the page.
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 60, ease: "linear" }}
                  className="bg-blue-600 h-2.5 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeaGardenOwnerDashboard;
