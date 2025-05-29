import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/h6.jpg"; // Update this path to your actual image

const DistributionPage = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [formData, setFormData] = useState({
    stockId: "",
    distributionType: "local",
    kgs: "",
    distributionDate: new Date().toISOString().split("T")[0],
    distributionTime: new Date().toLocaleTimeString("en-IN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    centerName: "",
    pricePerKg: 0,
  });
  const [availableKg, setAvailableKg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceSettings, setPriceSettings] = useState({
    localPrice: 500,
    exportPrice: 800,
  });
  const [filters, setFilters] = useState({
    stockId: "",
    distributionType: "",
    dateRange: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, distributionsRes, pricesRes] = await Promise.all([
          axios.get("http://localhost:5000/finished-tea/stock"),
          axios.get("http://localhost:5000/distribution"),
          axios.get("http://localhost:5000/distribution/prices"),
        ]);

        setStocks(stocksRes.data);
        setDistributions(distributionsRes.data);
        if (pricesRes.data) {
          setPriceSettings({
            localPrice: pricesRes.data.localPrice || 500,
            exportPrice: pricesRes.data.exportPrice || 800,
          });
          // Set initial price in form
          setFormData((prev) => ({
            ...prev,
            pricePerKg: pricesRes.data.localPrice || 500,
          }));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate available kg when stock changes
  useEffect(() => {
    if (formData.stockId) {
      const selectedStock = stocks.find((s) => s._id === formData.stockId);
      if (selectedStock) {
        const totalDistributed = distributions
          .filter((d) => d.stockId === formData.stockId)
          .reduce((sum, d) => sum + d.kgDistributed, 0);

        const available = (selectedStock.kgProduced || 0) - totalDistributed;
        setAvailableKg(available);
      }
    }
  }, [formData.stockId, stocks, distributions]);

  // Update price when distribution type changes
  useEffect(() => {
    const newPrice =
      formData.distributionType === "local"
        ? priceSettings.localPrice
        : priceSettings.exportPrice;
    setFormData((prev) => ({ ...prev, pricePerKg: newPrice }));
  }, [formData.distributionType, priceSettings]);

  // Filter distributions based on filter criteria
  const filteredDistributions = distributions.filter((dist) => {
    return (
      (filters.stockId === "" || dist.stockId === filters.stockId) &&
      (filters.distributionType === "" ||
        dist.distributionType === filters.distributionType) &&
      (filters.dateRange === "" ||
        new Date(dist.timestamp).toISOString().split("T")[0] ===
          filters.dateRange)
    );
  });

  // Sort distributions by date (newest first)
  const sortedDistributions = [...filteredDistributions].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const kgs = parseFloat(formData.kgs);

      if (!kgs || kgs <= 0) {
        alert("Please enter a valid quantity (kg)");
        return;
      }

      if (kgs > availableKg) {
        alert(`Cannot distribute more than available ${availableKg} kg`);
        return;
      }

      const response = await axios.post("http://localhost:5000/distribution", {
        ...formData,
        kgDistributed: kgs,
        totalPrice: kgs * parseFloat(formData.pricePerKg),
        timestamp: new Date(
          `${formData.distributionDate}T${formData.distributionTime}`
        ),
      });

      setDistributions([...distributions, response.data]);
      setFormData({
        stockId: "",
        distributionType: "local",
        kgs: "",
        distributionDate: new Date().toISOString().split("T")[0],
        distributionTime: new Date().toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        centerName: "",
        pricePerKg: priceSettings.localPrice,
      });
      alert("Distribution recorded successfully!");
    } catch (err) {
      console.error("Distribution error:", err.response?.data || err.message);
      alert("Failed to record distribution");
    }
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/distribution/prices",
        priceSettings
      );
      alert("Price settings updated successfully!");
    } catch (err) {
      console.error("Price update error:", err);
      alert("Failed to update price settings");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div
      className="p-8 min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Add space above the back button */}
      <div className="mb-14"></div>

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Tea Distribution Management
      </h1>

      {/* Price Settings Section */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Price Settings
        </h2>
        <form
          onSubmit={handlePriceUpdate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Local Market Price (per kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceSettings.localPrice}
              onChange={(e) =>
                setPriceSettings({
                  ...priceSettings,
                  localPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Export Price (per kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceSettings.exportPrice}
              onChange={(e) =>
                setPriceSettings({
                  ...priceSettings,
                  exportPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
            >
              Update Prices
            </button>
          </div>
        </form>
      </div>

      {/* New Distribution Section */}
      <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          New Distribution
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Stock ID
            </label>
            <select
              required
              name="stockId"
              value={formData.stockId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Stock</option>
              {stocks.map((stock) => (
                <option key={stock._id} value={stock._id}>
                  {stock.stockId} (Available: {availableKg} kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Distribution Type
            </label>
            <select
              required
              name="distributionType"
              value={formData.distributionType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="local">Local Market</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Kilograms (kg)
            </label>
            <input
              type="number"
              name="kgs"
              required
              min="0.1"
              step="0.1"
              value={formData.kgs}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Price per kg (LKR)
            </label>
            <input
              type="number"
              name="pricePerKg"
              required
              min="0"
              step="0.01"
              value={formData.pricePerKg}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Total
            </label>
            <div className="p-2 border rounded bg-gray-100">
              <p className="font-medium">Quantity: {formData.kgs || 0} kg</p>
              <p className="font-medium">
                Price: LKR{" "}
                {((formData.kgs || 0) * (formData.pricePerKg || 0)).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Date
            </label>
            <input
              type="date"
              name="distributionDate"
              required
              value={formData.distributionDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Time
            </label>
            <input
              type="time"
              name="distributionTime"
              required
              value={formData.distributionTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Distribution Center
            </label>
            <input
              type="text"
              name="centerName"
              required
              value={formData.centerName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter center name"
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors md:col-span-2"
          >
            Record Distribution
          </button>
        </form>
      </div>

      {/* Distribution History */}
      <div className="bg-white bg-opacity-90 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold p-6 text-gray-700">
          Distribution History
        </h2>

        {/* Filter Controls */}
        <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Filter by Stock ID
            </label>
            <select
              name="stockId"
              value={filters.stockId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stocks</option>
              {[...new Set(distributions.map((d) => d.stockId))].map(
                (stockId) => (
                  <option key={stockId} value={stockId}>
                    {stockId}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Filter by Type
            </label>
            <select
              name="distributionType"
              value={filters.distributionType}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="local">Local</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Filter by Date
            </label>
            <input
              type="date"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add space above the table */}
        <div className="mt-4"></div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KG Distributed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (LKR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Center Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDistributions.length > 0 ? (
                sortedDistributions.map((distribution) => (
                  <tr key={distribution._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {distribution.stockId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          distribution.distributionType === "export"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {distribution.distributionType === "export"
                          ? "Export"
                          : "Local"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {distribution.kgDistributed} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {distribution.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(distribution.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {distribution.centerName}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No distribution records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistributionPage;
