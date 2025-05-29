import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import backgroundImage from "../assets/h6.jpg"; // Import your background image

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarElement,
  Tooltip,
  Legend
);

/**
 * FactoryPayments Component
 *
 * This component provides a comprehensive interface for factory managers to:
 * - View and confirm pending bills
 * - Review payment history
 * - Analyze payment trends through charts
 * - Search and filter payment data
 */
const FactoryPayments = () => {
  // State variables
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bankDetails, setBankDetails] = useState({});

  // Filter states for pending bills table
  const [columnFilters, setColumnFilters] = useState({
    billNumber: "",
    gardenOwner: "",
    amount: "",
    date: "",
  });

  // Filter states for payment history table
  const [historyColumnFilters, setHistoryColumnFilters] = useState({
    date: "",
    gardenOwner: "",
    amount: "",
    bankDetails: "",
  });

  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetches payment history, pending bills, and bank details from the server
   * Sorts payment history by date in descending order (newest first)
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch payment history and pending bills in parallel
      const [historyResponse, billsResponse] = await Promise.all([
        axios.get("http://localhost:5000/tea-transport/payment-history"),
        axios.get("http://localhost:5000/tea-transport/bills/pending"),
      ]);

      // Sort payment history by date (newest first)
      const sortedHistory = [...historyResponse.data].sort((a, b) => {
        const dateA = new Date(a.paymentDate || a.transportDate);
        const dateB = new Date(b.paymentDate || b.transportDate);
        return dateB - dateA; // Descending order
      });

      setPaymentHistory(sortedHistory);
      setPendingBills(billsResponse.data);

      // Get unique garden owners from payment history
      const owners = [
        ...new Set(sortedHistory.map((payment) => payment.gardenOwner)),
      ];

      // Fetch bank details for each owner in parallel
      const detailsPromises = owners.map((owner) =>
        axios.get(`http://localhost:5000/api/account-details/${owner}`)
      );

      const detailsResponses = await Promise.all(detailsPromises);
      const detailsMap = {};
      owners.forEach((owner, index) => {
        detailsMap[owner] = detailsResponses[index].data;
      });

      setBankDetails(detailsMap);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data");
      setLoading(false);
    }
  };

  /**
   * Formats currency values to LKR (Sri Lankan Rupees)
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Toggles selection of a bill for payment
   * @param {string} billId - The ID of the bill to toggle
   */
  const toggleBillSelection = (billId) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  /**
   * Handles confirmation of selected payments
   * Refreshes data after successful payment
   */
  const handlePaymentConfirmation = async () => {
    if (selectedBills.length === 0) {
      alert("Please select at least one bill to pay");
      return;
    }

    try {
      setLoading(true);
      // Send payment confirmation to server
      await axios.post("http://localhost:5000/tea-transport/confirm-payments", {
        billIds: selectedBills,
      });

      // Refresh data after successful payment
      await fetchData();
      setSelectedBills([]);
      alert("Payments confirmed successfully!");
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      alert("Failed to confirm payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates column filters for pending bills table
   * @param {string} column - The column to filter
   * @param {string} value - The filter value
   */
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  /**
   * Updates column filters for payment history table
   * @param {string} column - The column to filter
   * @param {string} value - The filter value
   */
  const handleHistoryColumnFilterChange = (column, value) => {
    setHistoryColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  /**
   * Filters pending bills based on column filter values
   * @returns {Array} Filtered array of pending bills
   */
  const filteredPendingBills = pendingBills.filter((bill) => {
    const billDate = format(new Date(bill.transportDate), "dd MMM yyyy");
    return (
      bill.billNumber
        .toString()
        .toLowerCase()
        .includes(columnFilters.billNumber.toLowerCase()) &&
      bill.gardenOwner
        .toLowerCase()
        .includes(columnFilters.gardenOwner.toLowerCase()) &&
      bill.totalAmount.toString().includes(columnFilters.amount) &&
      billDate.toLowerCase().includes(columnFilters.date.toLowerCase())
    );
  });

  /**
   * Filters payment history based on column filter values
   * Supports multiple date formats in search (yyyy, MM/dd, etc.)
   * @returns {Array} Filtered array of payment history
   */
  const filteredPaymentHistory = paymentHistory.filter((payment) => {
    let displayDate;
    let searchableDate;
    try {
      const dateStr = payment.paymentDate || payment.transportDate;
      if (dateStr) {
        const dateObj = new Date(dateStr);
        displayDate = format(dateObj, "dd MMM yyyy");
        searchableDate = format(dateObj, "yyyy/MM/dd"); // Additional format for searching
      } else {
        displayDate = "N/A";
        searchableDate = "";
      }
    } catch (e) {
      displayDate = "Invalid date";
      searchableDate = "";
    }

    const details = bankDetails[payment.gardenOwner] || {};
    const bankInfo = details.bankName
      ? `${details.bankName} ${details.accountNumber} ${details.beneficiaryName}`.toLowerCase()
      : "not available";

    // Check if the search term matches any date format (dd MMM yyyy or yyyy/MM/dd)
    const dateMatch =
      displayDate
        .toLowerCase()
        .includes(historyColumnFilters.date.toLowerCase()) ||
      searchableDate
        .toLowerCase()
        .includes(historyColumnFilters.date.toLowerCase());

    return (
      dateMatch &&
      payment.gardenOwner
        .toLowerCase()
        .includes(historyColumnFilters.gardenOwner.toLowerCase()) &&
      (payment.amount || payment.totalAmount || 0)
        .toString()
        .includes(historyColumnFilters.amount) &&
      bankInfo.includes(historyColumnFilters.bankDetails.toLowerCase())
    );
  });

  /**
   * Prepares chart data from payment history
   * @returns {Object} Contains monthly payment data and owner-specific monthly data
   */
  const prepareChartData = () => {
    const monthlyData = {};
    const ownerMonthlyData = {};

    paymentHistory.forEach((payment) => {
      let paymentDate;
      try {
        paymentDate = new Date(payment.paymentDate || payment.transportDate);
        if (isNaN(paymentDate.getTime())) {
          console.warn("Invalid payment date:", payment);
          return;
        }
      } catch (e) {
        console.warn("Date parsing error:", e, payment);
        return;
      }

      // Group data by month
      const monthKey = format(paymentDate, "MMM yyyy");
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += payment.amount || payment.totalAmount || 0;

      // Group data by owner and month
      const owner = payment.gardenOwner;
      if (!ownerMonthlyData[owner]) {
        ownerMonthlyData[owner] = {};
      }
      if (!ownerMonthlyData[owner][monthKey]) {
        ownerMonthlyData[owner][monthKey] = 0;
      }
      ownerMonthlyData[owner][monthKey] +=
        payment.amount || payment.totalAmount || 0;
    });

    return { monthlyData, ownerMonthlyData };
  };

  // Prepare chart data
  const { monthlyData, ownerMonthlyData } = prepareChartData();

  // Line chart data configuration
  const lineChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: "Monthly Entire Cost of Payments (LKR)",
        data: Object.values(monthlyData),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Prepare data for the grouped bar chart
  const allMonths = Object.keys(monthlyData).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const owners = Object.keys(ownerMonthlyData);

  // Bar chart data configuration
  const barChartData = {
    labels: allMonths,
    datasets: owners.map((owner, index) => {
      const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#8AC24A",
        "#607D8B",
      ];
      return {
        label: owner,
        data: allMonths.map((month) => ownerMonthlyData[owner][month] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1,
      };
    }),
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-center text-gray-700">Loading payment data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content container with relative positioning */}
      <div className="relative z-10">
        {/* Back button section */}
        <div className="mt-16 mb-9">
          <button
            onClick={() => navigate("/Factory-Manager-Dashboard")}
            className="bg-white text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center px-4 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Page title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Payments Management</h1>
          <div className="w-24"></div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Entire Cost of Payments - Line Chart */}
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Monthly Entire Cost of Payments
            </h3>
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return formatCurrency(context.raw);
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value);
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Payment Distribution for Garden Owners Monthly - Bar Chart */}
          <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Payment Distribution for Garden Owners (Monthly)
            </h3>
            <div className="h-64">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.dataset.label}: ${formatCurrency(
                            context.raw
                          )}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      stacked: false,
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value);
                        },
                      },
                    },
                    x: {
                      stacked: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Payment Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Bills Section */}
          <div className="bg-white bg-opacity-90 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Bills</h2>
            {pendingBills.length === 0 ? (
              <p className="text-gray-500">No pending bills available</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>Bill #</div>
                          <input
                            type="text"
                            placeholder="Filter by bill number..."
                            className="mt-1 p-1 border rounded text-xs w-full"
                            value={columnFilters.billNumber}
                            onChange={(e) =>
                              handleColumnFilterChange(
                                "billNumber",
                                e.target.value
                              )
                            }
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>Garden Owner</div>
                          <input
                            type="text"
                            placeholder="Filter by garden owner..."
                            className="mt-1 p-1 border rounded text-xs w-full"
                            value={columnFilters.gardenOwner}
                            onChange={(e) =>
                              handleColumnFilterChange(
                                "gardenOwner",
                                e.target.value
                              )
                            }
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>Amount (LKR)</div>
                          <input
                            type="text"
                            placeholder="Filter by amount..."
                            className="mt-1 p-1 border rounded text-xs w-full"
                            value={columnFilters.amount}
                            onChange={(e) =>
                              handleColumnFilterChange("amount", e.target.value)
                            }
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>Date (dd MMM yyyy)</div>
                          <input
                            type="text"
                            placeholder="Filter by date (dd MMM yyyy or yyyy/MM/dd)..."
                            className="mt-1 p-1 border rounded text-xs w-full"
                            value={columnFilters.date}
                            onChange={(e) =>
                              handleColumnFilterChange("date", e.target.value)
                            }
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingBills.map((bill) => (
                        <tr key={bill._id}>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedBills.includes(bill._id)}
                              onChange={() => toggleBillSelection(bill._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {bill.billNumber}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {bill.gardenOwner}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(bill.totalAmount)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {format(
                              new Date(bill.transportDate),
                              "dd MMM yyyy"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handlePaymentConfirmation}
                    disabled={selectedBills.length === 0 || loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
                  >
                    {loading ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Payment History Section */}
          <div className="bg-white bg-opacity-90 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all payments..."
                  className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="w-4 h-4 absolute left-2.5 top-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {filteredPaymentHistory.length === 0 ? (
              <p className="text-gray-500">No payment history found</p>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>Date (dd MMM yyyy)</div>
                        <input
                          type="text"
                          placeholder="Filter by date (dd MMM yyyy or yyyy/MM/dd)..."
                          className="mt-1 p-1 border rounded text-xs w-full"
                          value={historyColumnFilters.date}
                          onChange={(e) =>
                            handleHistoryColumnFilterChange(
                              "date",
                              e.target.value
                            )
                          }
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>Garden Owner</div>
                        <input
                          type="text"
                          placeholder="Filter by garden owner..."
                          className="mt-1 p-1 border rounded text-xs w-full"
                          value={historyColumnFilters.gardenOwner}
                          onChange={(e) =>
                            handleHistoryColumnFilterChange(
                              "gardenOwner",
                              e.target.value
                            )
                          }
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>Amount (LKR)</div>
                        <input
                          type="text"
                          placeholder="Filter by amount..."
                          className="mt-1 p-1 border rounded text-xs w-full"
                          value={historyColumnFilters.amount}
                          onChange={(e) =>
                            handleHistoryColumnFilterChange(
                              "amount",
                              e.target.value
                            )
                          }
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>Bank Details</div>
                        <input
                          type="text"
                          placeholder="Filter by bank details..."
                          className="mt-1 p-1 border rounded text-xs w-full"
                          value={historyColumnFilters.bankDetails}
                          onChange={(e) =>
                            handleHistoryColumnFilterChange(
                              "bankDetails",
                              e.target.value
                            )
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPaymentHistory.map((payment) => {
                      let displayDate;
                      let searchableDate;
                      try {
                        const dateStr =
                          payment.paymentDate || payment.transportDate;
                        if (dateStr) {
                          const dateObj = new Date(dateStr);
                          displayDate = format(dateObj, "dd MMM yyyy");
                          searchableDate = format(dateObj, "yyyy/MM/dd");
                        } else {
                          displayDate = "N/A";
                          searchableDate = "";
                        }
                      } catch (e) {
                        displayDate = "Invalid date";
                        searchableDate = "";
                      }

                      const details = bankDetails[payment.gardenOwner] || {};

                      return (
                        <tr key={payment._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {displayDate}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {payment.gardenOwner}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(
                              payment.amount || payment.totalAmount || 0
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {details.bankName ? (
                              <div>
                                <div>{details.bankName}</div>
                                <div>A/C: {details.accountNumber}</div>
                                <div>{details.beneficiaryName}</div>
                              </div>
                            ) : (
                              "Not available"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryPayments;
