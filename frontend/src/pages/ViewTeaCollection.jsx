import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewTeaCollection = () => {
  const teaData = [
    {
      owner: "John Doe",
      kg: 250,
      transporter: "ABC Logistics",
      date: "2024-02-24",
    },
    {
      owner: "Jane Smith",
      kg: 180,
      transporter: "XYZ Transport",
      date: "2024-02-23",
    },
    {
      owner: "Michael Lee",
      kg: 300,
      transporter: "Tea Movers",
      date: "2024-02-22",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          View Tea Collection Data
        </h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Garden Owner</th>
              <th className="border border-gray-300 p-2">Kilograms</th>
              <th className="border border-gray-300 p-2">Transporter</th>
              <th className="border border-gray-300 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {teaData.map((data, index) => (
              <tr
                key={index}
                className="text-center bg-white border border-gray-300"
              >
                <td className="border border-gray-300 p-2">{data.owner}</td>
                <td className="border border-gray-300 p-2">{data.kg} kg</td>
                <td className="border border-gray-300 p-2">
                  {data.transporter}
                </td>
                <td className="border border-gray-300 p-2">{data.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTeaCollection;
