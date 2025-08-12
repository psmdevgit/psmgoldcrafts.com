
// "use client";

// import { useEffect, useState } from "react";
// import { fetchDealData as fetchCasting } from "@/data/crm/casting-data";
// import fetchFilling from "@/data/crm/filing-data";
// import fetchGrinding from "@/data/crm/grinding-data";
// import fetchSetting from "@/data/crm/setting-data";
// import fetchPolishing from "@/data/crm/polishing-data";
// import fetchDull from "@/data/crm/dull-data";
// import fetchPlating from "@/data/crm/plating-data";
// import fetchCutting from "@/data/crm/cutting-data";

// import { IProgressReportRow } from "@/interface/table.interface";
// import { format } from "date-fns";

// const processOptions = [
//   "All",
//   "Casting",
//   "Filing",
//   "Grinding",
//   "Setting",
//   "Polishing",
//   "Dull",
//   "Plating",
//   "Cutting",
// ];

// const formatDate = (dateStr: string) => {
//   if (!dateStr || dateStr === "-") return "-";
//   const date = new Date(dateStr);
//   return isNaN(date.getTime()) ? "-" : format(date, "dd-MM-yyyy");
// };

// const getStartOfYear = () => {
//   const now = new Date();
//   return `${now.getFullYear()}-01-01`;
// };

// const getToday = () => {
//   const now = new Date();
//   return format(now, "yyyy-MM-dd");
// };

// export default function ReportPage() {
//   const [selectedProcess, setSelectedProcess] = useState("All");
//   const [fromDate, setFromDate] = useState(getStartOfYear);
//   const [toDate, setToDate] = useState(getToday());
//   const [data, setData] = useState<Record<string, IProgressReportRow[]>>({});

//   const loadData = async () => {
//     const [casting, filling, grinding, setting, polishing, dull, plating, cutting] =
//       await Promise.all([
//         fetchCasting(),
//         fetchFilling(),
//         fetchGrinding(),
//         fetchSetting(),
//         fetchPolishing(),
//         fetchDull(),
//         fetchPlating(),
//         fetchCutting(),
//       ]);

//     const dataMap: Record<string, IProgressReportRow[]> = {
//       Casting: casting.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Filing: filling.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Grinding: grinding.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Setting: setting.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Polishing: polishing.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Dull: dull.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//       Plating: plating.map((row) => ({
//         issuedWeight: row.Issued_Weight__c,
//         receivedWeight: row.Received_Weight__c,
//         lossWeight: row.lossWeight,
//         issuedDate: row.Issued_Date__c,
//         receivedDate: row.Received_Date__c,
//       })),
//       Cutting: cutting.map((row) => ({
//         issuedWeight: row.issuedWeight,
//         receivedWeight: row.receivedWeight,
//         lossWeight: row.lossWeight,
//         issuedDate: row.issuedDate,
//         receivedDate: row.receivedDate,
//       })),
//     };

//     setData(dataMap);
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const filterByDate = (item: IProgressReportRow): boolean => {
//     const issued = new Date(item.issuedDate);
//     const from = fromDate ? new Date(fromDate) : null;
//     const to = toDate ? new Date(toDate) : null;
//     if (from && issued < from) return false;
//     if (to && issued > to) return false;
//     return true;
//   };

// const renderSummaryTable = () => {
//   const processKeys = Object.keys(data);

//   const summaryRows = processKeys
//     .filter((process) => selectedProcess === "All" || selectedProcess === process)
//     .map((process) => {
//       const rows = data[process]?.filter(filterByDate) || [];

//       const totalIssued = rows.reduce((sum, r) => sum + (parseFloat(r.issuedWeight) || 0), 0);
//       const totalReceived = rows.reduce((sum, r) => sum + (parseFloat(r.receivedWeight) || 0), 0);
//       const totalLoss = rows.reduce((sum, r) => sum + (parseFloat(r.lossWeight) || 0), 0);
//         const totalScarp = rows.reduce((sum, r) => sum + (parseFloat(r.scrapWeight) || 0), 0);
//           const totalDust = rows.reduce((sum, r) => sum + (parseFloat(r.dustWeight) || 0), 0);

//       return {
//         process,
//         totalIssued,
//         totalReceived,
//         totalLoss,
//         totalScarp,totalDust
//       };
//     });

//    return (
//     <div className="border p-4 mb-6 rounded shadow" style={{ backgroundColor: "#eee" }}>
//       <h2 className="text-lg font-semibold mb-3">
//         {selectedProcess === "All" ? "Process Summary" : `${selectedProcess} Summary`}
//       </h2>

//       <div className="overflow-x-auto">
//         <table className="table-auto w-full border text-sm text-center" style={{ backgroundColor: "#fff" }}>
//           <thead style={{ backgroundColor: "#EDB652", color: "#111" }}>
//             <tr>
//               <th className="border px-2 py-1">Process</th>
//               <th className="border px-2 py-1">Total Issued Weight</th>
//               <th className="border px-2 py-1">Total Received Weight</th>
//               <th className="border px-2 py-1">Total Loss Weight</th>
//               <th className="border px-2 py-1">Total Scrap Weight</th>
//               <th className="border px-2 py-1">Total Dust Weight</th>
//             </tr>
//           </thead>
//           <tbody>
//             {summaryRows.length > 0 ? (
//               summaryRows.map((row, idx) => (
//                 <tr key={idx}>
//                   <td className="border px-2 py-1">{row.process}</td>
//                   <td className="border px-2 py-1">{row.totalIssued.toFixed(3)}</td>
//                   <td className="border px-2 py-1">{row.totalReceived.toFixed(3)}</td>
//                   <td className="border px-2 py-1">{row.totalLoss.toFixed(3)}</td>
//                   <td className="border px-2 py-1">{row.totalScarp.toFixed(3)}</td>
//                   <td className="border px-2 py-1">{row.totalDust.toFixed(3)}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td className="border px-2 py-2 text-center" colSpan={4}>
//                   No data found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

//   const renderTable = (process: string, rows: IProgressReportRow[]) => {
//     const filteredRows = rows.filter(filterByDate);

//     return (
//       <div className="border p-4 mb-6 rounded shadow" style={{ backgroundColor: "#eee" }}>
//         <h2 className="text-lg font-semibold mb-3">{process}</h2>
//         <div className="overflow-x-auto">
//           <table className="table-auto w-full border text-sm text-center" style={{ backgroundColor: "#fff" }}>
//             <thead style={{ backgroundColor: "#EDB652", color: "#111" }}>
//               <tr>
//                 <th className="border px-2 py-1">Issued Weight</th>
//                 <th className="border px-2 py-1">Received Weight</th>
//                 <th className="border px-2 py-1">Loss Weight</th>
//                 <th className="border px-2 py-1">Issued Date</th>
//                 <th className="border px-2 py-1">Received Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredRows.length > 0 ? (
//                 filteredRows.map((row, idx) => (
//                   <tr key={idx}>
//                     <td className="border px-2 py-1">{row.issuedWeight}</td>
//                     <td className="border px-2 py-1">{row.receivedWeight}</td>
//                     <td className="border px-2 py-1">{row.lossWeight}</td>
//                     <td className="border px-2 py-1">{formatDate(row.issuedDate)}</td>
//                     <td className="border px-2 py-1">{formatDate(row.receivedDate)}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td className="border px-2 py-2 text-center" colSpan={5}>
//                     No data found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 space-y-6 progress-report">
//       <h1 className="text-2xl font-bold">Process Reports</h1>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 items-end">
//         <div>
//           <label className="block text-sm mb-1">Process</label>
//           <select
//             value={selectedProcess}
//             onChange={(e) => setSelectedProcess(e.target.value)}
//             className="border rounded p-2 text-sm"
//           >
//             {processOptions.map((option) => (
//               <option key={option} value={option}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm mb-1">From Date</label>
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="border rounded p-2 text-sm"
//           />
//         </div>

//         <div>
//           <label className="block text-sm mb-1">To Date</label>
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="border rounded p-2 text-sm"
//           />
//         </div>
//       </div>

//       {/* Tables */}
//                       {renderSummaryTable()}


//       <style jsx global>{`
//         .progress-report {
//           padding-top: 75px;
//           width: 85%;
//           margin-left: auto;
//           margin-right: 0;
//         }

//         @media (max-width: 768px) {
//           .progress-report {
//             width: 100%;
//             margin: 0 auto;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "-") return "-";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "-" : format(date, "dd-MM-yyyy");
};

const getStartOfYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

const getToday = () => {
  const now = new Date();
  return format(now, "yyyy-MM-dd");
};

interface ProcessRow {
  process: string;
  issued_wt: number;
  received_wt: number;
  loss_wt: number;
  scrap_wt: number;
  dust_wt: number;
}

export default function SummaryPage() {
  const [data, setData] = useState<ProcessRow[]>([]);
  const [fromDate, setFromDate] = useState(getStartOfYear);
  const [toDate, setToDate] = useState(getToday());

//  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://erp-server-r9wh.onrender.com" ;



  const fetchData = async () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (from > to) {
        alert("From Date cannot be greater than To Date");
       setFromDate(getStartOfYear());
        return;
      }

      if (to < from) {
        alert("To Date cannot be earlier than From Date");
        setToDate(getToday());
        return;
      }
    }

    const query = `${API_URL}/api/process-summary?fromDate=${fromDate}&toDate=${toDate}`;

    try {
      const res = await fetch(query);
      const result = await res.json();

      if (!result.success) {
        console.error("Error fetching data:", result.message);
        return;
      }

      setData(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  return (
    <div className="p-4 progress-report ">
      <h1 className="text-xl font-bold mb-4">Process Summary</h1>

   <div className="flex justify-center items-center gap-8 mb-4 p-2" style={{backgroundColor:"#eee", width:"50%", margin:"auto"}}>
  <div className="flex items-center gap-2">
    <label className="font-medium">From Date:</label>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="border p-2 rounded"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="font-medium">To Date:</label>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="border p-2 rounded"
    />
  </div>
</div>

<div className="mt-5 p-5 overflow-x-auto tablediv" style={{display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"#eee", borderRadius:"20px"}}>
     <table className="w-full border border-collapse" style={{width:"75%", backgroundColor:"#fff"}}>
        <thead>
         <tr className="bg-gray-100" style={{ backgroundColor: "#EDB652", color: "#222", fontSize: "1rem" }}>
  <th className="border p-2">
    Process
  </th>
  <th className="border p-2">
    Issued Wt
    <span className="text-xs ps-2 text-gray-700">(gm)</span>
  </th>
  <th className="border p-2">
    Received Wt
    <span className="text-xs ps-2 text-gray-700">(gm)</span>
  </th>
  <th className="border p-2">
    Loss Wt
    <span className="text-xs ps-2 text-gray-700">(gm)</span>
  </th>
  <th className="border p-2">
    Scrap Wt
    <span className="text-xs ps-2 text-gray-700">(gm)</span>
  </th>
  <th className="border p-2">
    Dust Wt
    <span className="text-xs ps-2 text-gray-700">(gm)</span>
  </th>
</tr>

        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="text-center">
              <td className="border p-2" style={{color:"#444", fontWeight:"700"}}>{row.process}</td>
              <td className="border p-2">{+row.issued_wt.toFixed(2)}</td>
              <td className="border p-2">{+row.received_wt.toFixed(2)}</td>
              <td className="border p-2">{+row.loss_wt.toFixed(2)}</td>
              <td className="border p-2">{+row.scrap_wt.toFixed(2)}</td>
              <td className="border p-2">{+row.dust_wt.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
