import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { format, parseISO } from "date-fns";
import h5 from "../assets/h5.jpg";

const MonthlyReportPage = () => {
  const [rawTeaData, setRawTeaData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for search filters - column-wise for each table
  const [rawTeaSearch, setRawTeaSearch] = useState({
    month: "",
    totalKgs: "",
    totalAmount: "",
  });

  const [productionSearch, setProductionSearch] = useState({
    month: "",
    kgProduced: "",
    rawTeaUsed: "",
    wastage: "",
    efficiency: "",
  });

  const [incomeSearch, setIncomeSearch] = useState({
    month: "",
    exportIncome: "",
    localIncome: "",
    totalIncome: "",
  });

  // Background image style
  const backgroundStyle = {
    backgroundImage: `url(${h5})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
  };

  // Fetch data from API endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawRes, stockRes, incomeRes] = await Promise.all([
          axios.get("http://localhost:5000/tea-transport/payment-data"),
          axios.get("http://localhost:5000/finished-tea/monthly-stock"),
          axios.get("http://localhost:5000/distribution/monthly-income"),
        ]);

        // Process raw tea data
        const processedRaw = rawRes.data
          .map((item) => ({
            month: `${item._id.year}-${item._id.month
              .toString()
              .padStart(2, "0")}`,
            totalKgs: item.totalKgs,
            totalAmount: item.totalAmount,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        // Process stock/production data
        const processedStock = stockRes.data
          .map((item) => ({
            month: `${item._id.year}-${item._id.month
              .toString()
              .padStart(2, "0")}`,
            kgProduced: item.kgProduced,
            rawTeaUsed: item.rawTeaUsed,
            wastage: item.wastage,
            efficiency: ((item.kgProduced / item.rawTeaUsed) * 100).toFixed(2),
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

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

        setRawTeaData(processedRaw);
        setStockData(processedStock);
        setIncomeData(processedIncome);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter raw tea data based on column searches
  const filteredRawTeaData = rawTeaData
    .filter(
      (item) =>
        format(parseISO(`${item.month}-01`), "MMM yyyy")
          .toLowerCase()
          .includes(rawTeaSearch.month.toLowerCase()) &&
        item.totalKgs.toString().includes(rawTeaSearch.totalKgs) &&
        item.totalAmount.toString().includes(rawTeaSearch.totalAmount)
    )
    .slice(-10) // Show only last 10 records
    .reverse(); // Show recent first

  // Filter production data based on column searches
  const filteredStockData = stockData
    .filter(
      (item) =>
        format(parseISO(`${item.month}-01`), "MMM yyyy")
          .toLowerCase()
          .includes(productionSearch.month.toLowerCase()) &&
        item.kgProduced.toString().includes(productionSearch.kgProduced) &&
        item.rawTeaUsed.toString().includes(productionSearch.rawTeaUsed) &&
        item.wastage.toString().includes(productionSearch.wastage) &&
        item.efficiency.toString().includes(productionSearch.efficiency)
    )
    .slice(-10)
    .reverse();

  // Filter income data based on column searches
  const filteredIncomeData = incomeData
    .filter(
      (item) =>
        format(parseISO(`${item.month}-01`), "MMM yyyy")
          .toLowerCase()
          .includes(incomeSearch.month.toLowerCase()) &&
        item.exportIncome.toString().includes(incomeSearch.exportIncome) &&
        item.localIncome.toString().includes(incomeSearch.localIncome) &&
        item.totalIncome.toString().includes(incomeSearch.totalIncome)
    )
    .slice(-10)
    .reverse();

  // Chart options (same as before)
  const rawTeaChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: rawTeaData.map((d) =>
        format(parseISO(`${d.month}-01`), "MMM yyyy")
      ),
      title: {
        text: "Month",
      },
    },
    yaxis: {
      title: {
        text: "Kilograms (kg)",
      },
    },
    colors: ["#3B82F6"],
    title: {
      text: "Monthly Raw Tea Consumption",
      align: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()} kg`,
      },
    },
  };

  const productionChartOptions = {
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
      categories: stockData.map((d) =>
        format(parseISO(`${d.month}-01`), "MMM yyyy")
      ),
      title: {
        text: "Month",
      },
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
    title: {
      text: "Production Metrics",
      align: "center",
    },
    legend: {
      position: "top",
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()}`,
      },
    },
  };

  const incomeChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: incomeData.map((d) =>
        format(parseISO(`${d.month}-01`), "MMM yyyy")
      ),
      title: {
        text: "Month",
      },
    },
    yaxis: {
      title: {
        text: "Income (LKR)",
      },
      labels: {
        formatter: (value) => `LKR ${value.toLocaleString()}`,
      },
    },
    colors: ["#8B5CF6", "#10B981"],
    title: {
      text: "Monthly Income Distribution",
      align: "center",
    },
    legend: {
      position: "top",
    },
    tooltip: {
      y: {
        formatter: (value) => `LKR ${value.toLocaleString()}`,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-100 bg-opacity-90"
      style={backgroundStyle}
    >
      {/* Added more space above the back button */}
      <div className="pt-12"></div>

      <div className="p-8">
        {/* Header section with smaller white back button and title */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/Factory-Manager-Dashboard")}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm text-sm border border-gray-200"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white text-center">
            Monthly Production Report
          </h1>
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>

        <div className="space-y-10">
          {/* Raw Tea Consumption Section */}
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Raw Tea Usage
              </h2>
            </div>

            <Chart
              options={rawTeaChartOptions}
              series={[
                {
                  name: "Raw Tea Used",
                  data: rawTeaData.map((d) => d.totalKgs),
                },
              ]}
              type="bar"
              height={350}
            />

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">
                Showing last 10 records. Scroll to see more.
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Month"
                          className="w-full p-1 text-xs border rounded"
                          value={rawTeaSearch.month}
                          onChange={(e) =>
                            setRawTeaSearch({
                              ...rawTeaSearch,
                              month: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Kgs"
                          className="w-full p-1 text-xs border rounded"
                          value={rawTeaSearch.totalKgs}
                          onChange={(e) =>
                            setRawTeaSearch({
                              ...rawTeaSearch,
                              totalKgs: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Amount"
                          className="w-full p-1 text-xs border rounded"
                          value={rawTeaSearch.totalAmount}
                          onChange={(e) =>
                            setRawTeaSearch({
                              ...rawTeaSearch,
                              totalAmount: e.target.value,
                            })
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRawTeaData.map((monthData, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {format(
                            parseISO(`${monthData.month}-01`),
                            "MMM yyyy"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {monthData.totalKgs.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          LKR {monthData.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Production Metrics Section */}
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Production Metrics
              </h2>
            </div>

            <Chart
              options={productionChartOptions}
              series={[
                {
                  name: "Tea Produced",
                  data: stockData.map((d) => d.kgProduced),
                },
                {
                  name: "Raw Tea Used",
                  data: stockData.map((d) => d.rawTeaUsed),
                },
                {
                  name: "Production Efficiency (%)",
                  data: stockData.map((d) => d.efficiency),
                },
              ]}
              type="line"
              height={350}
            />

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">
                Showing last 10 records. Scroll to see more.
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Month"
                          className="w-full p-1 text-xs border rounded"
                          value={productionSearch.month}
                          onChange={(e) =>
                            setProductionSearch({
                              ...productionSearch,
                              month: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Produced"
                          className="w-full p-1 text-xs border rounded"
                          value={productionSearch.kgProduced}
                          onChange={(e) =>
                            setProductionSearch({
                              ...productionSearch,
                              kgProduced: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Used"
                          className="w-full p-1 text-xs border rounded"
                          value={productionSearch.rawTeaUsed}
                          onChange={(e) =>
                            setProductionSearch({
                              ...productionSearch,
                              rawTeaUsed: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Wastage"
                          className="w-full p-1 text-xs border rounded"
                          value={productionSearch.wastage}
                          onChange={(e) =>
                            setProductionSearch({
                              ...productionSearch,
                              wastage: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Efficiency"
                          className="w-full p-1 text-xs border rounded"
                          value={productionSearch.efficiency}
                          onChange={(e) =>
                            setProductionSearch({
                              ...productionSearch,
                              efficiency: e.target.value,
                            })
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStockData.map((monthData, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {format(
                            parseISO(`${monthData.month}-01`),
                            "MMM yyyy"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {monthData.kgProduced.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {monthData.rawTeaUsed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {monthData.wastage.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {monthData.efficiency}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Income Section */}
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Income Report
              </h2>
            </div>

            <Chart
              options={incomeChartOptions}
              series={[
                {
                  name: "Export Income",
                  data: incomeData.map((d) => d.exportIncome),
                },
                {
                  name: "Local Income",
                  data: incomeData.map((d) => d.localIncome),
                },
              ]}
              type="bar"
              height={350}
            />

            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">
                Showing last 10 records. Scroll to see more.
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Month"
                          className="w-full p-1 text-xs border rounded"
                          value={incomeSearch.month}
                          onChange={(e) =>
                            setIncomeSearch({
                              ...incomeSearch,
                              month: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Export"
                          className="w-full p-1 text-xs border rounded"
                          value={incomeSearch.exportIncome}
                          onChange={(e) =>
                            setIncomeSearch({
                              ...incomeSearch,
                              exportIncome: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Local"
                          className="w-full p-1 text-xs border rounded"
                          value={incomeSearch.localIncome}
                          onChange={(e) =>
                            setIncomeSearch({
                              ...incomeSearch,
                              localIncome: e.target.value,
                            })
                          }
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="text"
                          placeholder="Search Total"
                          className="w-full p-1 text-xs border rounded"
                          value={incomeSearch.totalIncome}
                          onChange={(e) =>
                            setIncomeSearch({
                              ...incomeSearch,
                              totalIncome: e.target.value,
                            })
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIncomeData.map((monthData, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {format(
                            parseISO(`${monthData.month}-01`),
                            "MMM yyyy"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          LKR {monthData.exportIncome.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          LKR {monthData.localIncome.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          LKR {monthData.totalIncome.toLocaleString()}
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
    </div>
  );
};

export default MonthlyReportPage;
