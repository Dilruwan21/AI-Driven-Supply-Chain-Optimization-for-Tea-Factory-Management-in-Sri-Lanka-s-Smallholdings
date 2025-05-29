import React from "react";

const FactoryInventory = () => {
  const inventoryData = [
    { item: "Raw Tea Leaves", quantity: "500 kg", status: "Available" },
    { item: "Black Tea", quantity: "200 kg", status: "Processing" },
    { item: "Green Tea", quantity: "150 kg", status: "Low Stock" },
    { item: "Herbal Tea", quantity: "100 kg", status: "Available" },
  ];

  const suppliers = [
    { name: "Supplier A", schedule: "Monday & Thursday" },
    { name: "Supplier B", schedule: "Wednesday & Saturday" },
  ];

  const reports = ["Daily Report", "Weekly Report", "Monthly Report"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Factory Inventory Management
        </h1>

        {/* Inventory Table */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Raw Material Tracking
        </h2>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Item Name</th>
              <th className="border border-gray-300 p-2">Quantity</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((data, index) => (
              <tr
                key={index}
                className="text-center bg-white border border-gray-300"
              >
                <td className="border border-gray-300 p-2">{data.item}</td>
                <td className="border border-gray-300 p-2">{data.quantity}</td>
                <td
                  className={`border border-gray-300 p-2 font-semibold ${
                    data.status === "Low Stock"
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  {data.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Supplier & Transport Management */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Supplier & Transport Management
        </h2>
        <ul className="mb-4">
          {suppliers.map((supplier, index) => (
            <li key={index} className="border-b p-2">
              {supplier.name} - {supplier.schedule}
            </li>
          ))}
        </ul>

        {/* Reports & Analytics */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Reports & Analytics
        </h2>
        <ul className="mb-4">
          {reports.map((report, index) => (
            <li key={index} className="border-b p-2">
              {report}
            </li>
          ))}
        </ul>

        {/* User Access Control */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          User Access Control
        </h2>
        <p>Allow Factory Manager and Supervisor to manage stock.</p>
      </div>
    </div>
  );
};

export default FactoryInventory;
