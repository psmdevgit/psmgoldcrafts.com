
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";



interface ProcessRow {
  process: string;
  issued_wt: number;  
  process_wt: number;
  received_wt: number;
  loss_wt: number;
  scrap_wt: number;
  dust_wt: number;
}

export default function SummaryPage() {
  const [data, setData] = useState<ProcessRow[]>([]);
  
    const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false); // ✅ newL
  
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string | null>(null);



     


interface Report {
  name: string;
  availableWeight: number;
  purity: string;
} 
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://erp-server-r9wh.onrender.com" ;

  
// const API_URL = "http://localhost:5001"

  const fetchData = async () => {
  

    const query = `${API_URL}/api/process-report`;

    setLoading(true); 
    try {
      const res = await fetch(query);
      const result = await res.json();

      console.log(result)

      if (!result.success) {
        console.error("Error fetching data:", result.message);
        return;
      }

      setData(result.data);

      console.log(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    finally {
      setLoading(false); // ✅ stop loading
    }

  };

  
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
  <div className="p-4 progress-report flex flex-col lg:flex-row gap-6">
  {/* Left Column */}
  <div className="">
    <h1 className="text-xl font-bold mb-4">Process Summary</h1>
    <div
      className="mt-5 p-5 overflow-x-auto"
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      //   backgroundColor: "#eee",
      //   borderRadius: "20px",
      // }}
    >
      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : (
        <table
          className="border border-collapse"
          style={{   width:'100%', backgroundColor: "#fff" }}
        >
          <thead>
            <tr
              className="bg-gray-100"
              style={{ backgroundColor: "#1a7a75", color: "#fff", fontSize:"1rem" }}
            >
              <th className="border p-2">Process</th>
              <th className="border p-2">
                Processing Wt <span className="text-xs ps-2 text-white-700">(gm)</span>
              </th> 
              {/* <th className="border p-2">
                Received Wt <span className="text-xs ps-2 text-gray-700">(gm)</span>
              </th> */}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border p-2 text-left" style={{ color: "#444", fontWeight: "500" }}>
                    {row.process}
                  </td>
                  <td className="border p-2">{Number(row.process_wt || 0).toFixed(2)}</td>
                  {/* <td className="border p-2">{Number(row.received_wt || 0).toFixed(2)}</td> */}
                  {/* <td className="border p-2">{Number(row.issued_wt || 0).toFixed(2)}</td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  </div>

  {/* Right Column */}
  <div className="" style={{marginRight:'-250px; !important'}}>
    <h1 className="text-xl font-bold mb-4 ">Inventory Items</h1>

<div className="mt-5  overflow-x-auto" 
//  style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#eee",
//         borderRadius: "20px",
//       }}
      >

  {isLoading && <p className="text-gray-500">Loading...</p>}
    {error && <p className="text-red-500">Error: {error}</p>}

    {!isLoading && !error && reports.length === 0 && (
      <p className="text-gray-500">No reports found.</p>
    )}

    {!isLoading && !error && reports.length > 0 && (
      <div className="overflow-x-auto">
          <table
          className="border border-collapse"
          style={{ width: "100%", backgroundColor: "#fff" }}
        >
          <thead className="bg-[#1A7A75] text-white">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Item</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Purity</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Avl Weight (g)</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Purity Gold Wt (g)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
                {reports
                  .filter(
                    (report) => Number(report.availableWeight) > 0
                  )
                .map((report, index) => {
  // Normalize the purity string for comparison
  const purityString = String(report.purity).trim().toLowerCase();

  let purityValue: number;

  if (purityString.includes("22k")) {
    purityValue = 91.7; // hardcode percentage for 22K gold
  } else {
    purityValue = parseFloat(purityString) || 0;
  }

  const availableWeightValue = Number(report.availableWeight) || 0;

  const purityGoldWeight = (
    (purityValue * availableWeightValue) / 100
  ).toFixed(4);

  return (
    <tr key={`${report.name}-${index}`} className="hover:bg-gray-50">
      <td className="px-4 py-2 text-sm text-gray-800">{report.name}</td>
      <td className="px-4 py-2 text-sm text-gray-800">{report.purity}</td>
      <td className="px-4 py-2 text-sm text-gray-800">{availableWeightValue.toFixed(4)}</td>
      <td className="px-4 py-2 text-sm text-gray-800">{purityGoldWeight}</td>
    </tr>
  );
})

                  
                  }
              </tbody>
        </table>
      </div>
    )}

</div>
  
  </div>

      <style jsx global>{`
        .progress-report {
          height: 100vh;
          padding-top: 75px;
          width: 85%;
          margin-left: auto;
          margin-right: 0;
        }
     
        @media (max-width: 768px) {
          .progress-report {
            width: 100%;
            margin: 0 auto;
          }
        }
      `}</style>

</div>

  );
}

  