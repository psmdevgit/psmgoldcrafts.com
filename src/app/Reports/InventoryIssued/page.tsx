// "use client";
// import React, { useEffect, useState } from "react";

// interface Report {
//   Id: string;
//   Name: string;
//   Issued_Date: string;
//   Purity: number;
//   PureMetalweight: number;
//   AlloyWeight: number;
//   CreatedDate: string;
//   CreatedByName: string;
// }

// const InventoryTransaction: React.FC = () => {
//   const [reports, setReports] = useState<Report[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await fetch(`${API_URL}/get-inventory-transactions`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch reports");
//         }

//         const data = await response.json();
//         console.log("Fetched raw data:", data);

//         let reportData: Report[] = [];

//         if (Array.isArray(data.data)) {
//           reportData = data.data.map((item: any) => ({
//             Id: item.id,
//             Name: item.name,
//             Issued_Date: item.issuedDate,
//             Purity: item.purity,
//             PureMetalweight: item.pureMetalWeight,
//             AlloyWeight: item.alloyWeight,
//             CreatedDate: item.createdDate,
//             CreatedByName: item.createdByName
//           }));
//         } else {
//           throw new Error("Unexpected data format from server");
//         }

//         console.log("Mapped report data:", reportData);
//         setReports(reportData);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchReports();
//   }, [API_URL]);

//   return (
//     <div className="w-full mt-24">
//       <div className="max-w-screen-md mx-auto p-6 bg-white shadow rounded-lg">
//         <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">Inventory Transactions</h1>

//         {isLoading && <p className="text-gray-500">Loading...</p>}
//         {error && <p className="text-red-500">Error: {error}</p>}

//         {!isLoading && !error && reports.length === 0 && (
//           <p className="text-gray-500">No reports found.</p>
//         )}

//         {!isLoading && !error && reports.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-[#1A7A75]" style={{ color: "white" }}>
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">Item</th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">Purity</th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">Issued Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {reports.map((report, index) => (
//                   <tr key={`${report.Id}-${index}`} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 text-sm text-gray-800">{report.Name}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{report.Purity}</td>
//                     <td className="px-4 py-2 text-sm text-gray-800">{report.Issued_Date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InventoryTransaction;

"use client";
import React, { useEffect, useState } from "react";

interface Report {
  Id: string;
  Name: string;
  Issued_Date: string;
  Purity: number;
  PureMetalweight: number;
  AlloyWeight: number;
  CreatedDate: string;
  CreatedByName: string;
  Order: string;
}

// For input field date format
const formatDateInput = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const InventoryTransaction: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [fromDate, setFromDate] = useState(formatDateInput(startOfYear));
  const [toDate, setToDate] = useState(formatDateInput(today));
  const [selectedName, setSelectedName] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState("All");

  const [allNames, setAllNames] = useState<string[]>([]);
  const [allOrders, setAllOrders] = useState<string[]>([]);

  const API_URL = "http://localhost:5001";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/get-inventory-transactions`);
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();

        let reportData: Report[] = [];
        if (Array.isArray(data.data)) {
          reportData = data.data.map((item: any) => ({
            Id: item.id,
            Name: item.name,
            Issued_Date: item.issuedDate,
            Purity: item.purity,
            PureMetalweight: item.pureMetalWeight,
            AlloyWeight: item.alloyWeight,
            CreatedDate: item.createdDate,
            CreatedByName: item.createdByName,
            Order: item.order,
          }));
        }

        // build dropdown lists
        const uniqueNames = Array.from(new Set(reportData.map((r) => r.Name))).filter(Boolean);
        const uniqueOrders = Array.from(new Set(reportData.map((r) => r.Order))).filter(Boolean);

        setAllNames(["All", ...uniqueNames]);
        setAllOrders(["All", ...uniqueOrders]);

        setReports(reportData);
        setFilteredReports(reportData);

        console.log(reportData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [API_URL]);

  // 🔁 Filter on date, name, order
// 🔁 Filter on date, name, order
useEffect(() => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  // ⏰ Adjust toDate to end of the selected day
  to.setHours(23, 59, 59, 999);

  const filtered = reports.filter((report) => {
    const created = new Date(report.CreatedDate);
    const dateInRange = created >= from && created <= to;
    const nameMatch = selectedName === "All" || report.Name === selectedName;
    const orderMatch = selectedOrder === "All" || report.Order === selectedOrder;
    return dateInRange && nameMatch && orderMatch;
  });

  setFilteredReports(filtered);
}, [fromDate, toDate, selectedName, selectedOrder, reports]);


  return (
    <div className="w-full mt-20">
      <div className="max-w-screen-lg mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
          Inventory Transactions
        </h1>

        {/* 🔎 Filter Controls */}
        <div className="flex gap-2 mb-6 flex-wrap">
        <div>
  <label className="text-sm text-gray-700">From Date</label>
  <input
    type="date"
    className="border rounded px-3 py-1 w-full"
    value={fromDate}
    onChange={(e) => {
      const newFrom = e.target.value;
      if (new Date(newFrom) > new Date(toDate)) {
        alert("From Date cannot be greater than To Date");
        setFromDate(formatDateInput(startOfYear)); // reset to default
      } else {
        setFromDate(newFrom);
      }
    }}
  />
</div>

<div>
  <label className="text-sm text-gray-700">To Date</label>
  <input
    type="date"
    className="border rounded px-3 py-1 w-full"
    value={toDate}
    onChange={(e) => {
      const newTo = e.target.value;
      if (new Date(newTo) < new Date(fromDate)) {
        alert("To Date cannot be earlier than From Date");
        setToDate(formatDateInput(today)); // reset to today
      } else {
        setToDate(newTo);
      }
    }}
  />
</div>


          <div>
            <label className="text-sm text-gray-700">Filter by Item Name</label>
            <select
              className="border rounded px-3 py-1 w-full"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {allNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Filter by Order ID</label>
            <select
              className="border rounded px-3 py-1 w-full"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              {allOrders.map((order) => (
                <option key={order} value={order}>
                  {order}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && filteredReports.length === 0 && (
          <p className="text-gray-500">No reports found.</p>
        )}

        {!isLoading && !error && filteredReports.length > 0 && (
          <div className="space-y-10">
            {Object.entries(
              filteredReports.reduce<Record<string, Report[]>>((acc, report) => {
                if (!acc[report.Name]) acc[report.Name] = [];
                acc[report.Name].push(report);
                return acc;
              }, {})
            ).map(([name, items]) => (
              <div key={name}>
                <h2 className="text-xl font-semibold mb-2 text-[#1A7A75]">{name}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-md">
                    <thead className="bg-[#1A7A75] text-white">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Order ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Purity</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Pure Metal Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Alloy Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Created Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Issued Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((report, index) => (
                        <tr key={`${report.Id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.Order || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.Purity || "-"}
                          </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                            {report.PureMetalweight != null ? report.PureMetalweight.toFixed(4) : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.AlloyWeight != null ? report.AlloyWeight.toFixed(4) : "-"}
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.CreatedDate
                              ? new Date(report.CreatedDate).toLocaleDateString("en-GB")
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.Issued_Date
                              ? new Date(report.Issued_Date).toLocaleDateString("en-GB")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTransaction;
