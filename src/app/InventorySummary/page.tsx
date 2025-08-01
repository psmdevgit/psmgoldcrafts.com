"use client";
import React, { useEffect, useState } from 'react';

interface Report {
  name: string;
  availableWeight: number;
  purity: string;
}

const InventoryItemSummary: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://erp-server-r9wh.onrender.com";

useEffect(() => {
  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/get-inventory`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      console.log("Fetched data:", data);

      let reportData: Report[] = [];

      if (Array.isArray(data)) {
        reportData = data;
      } else if (Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        throw new Error("Unexpected data format");
      }

      // Sort by name ascending
      reportData.sort((a, b) => a.name.localeCompare(b.name));

      setReports(reportData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchReports();
}, []);


  return (
    <div className="w-full mt-24">
      <div className="max-w-screen-md mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">Inventory Items Summary</h1>

        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && reports.length === 0 && (
          <p className="text-gray-500">No reports found.</p>
        )}

        {!isLoading && !error && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1A7A75]" style={{color:"white"}}>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold ">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold ">Purity</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold ">Avl Weight (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report, index) => (
                  <tr key={`${report.name}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{report.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{report.purity}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{report.availableWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryItemSummary;
