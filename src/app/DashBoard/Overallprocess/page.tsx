

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
  process_wt: number;
  received_wt: number;
  loss_wt: number;
  scrap_wt: number;
  dust_wt: number;
}

export default function SummaryPage() {
  const [data, setData] = useState<ProcessRow[]>([]);
  const [fromDate, setFromDate] = useState(getStartOfYear);
  const [toDate, setToDate] = useState(getToday());
  
  const [loading, setLoading] = useState(false); // ✅ new

//  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://erp-server-r9wh.onrender.com" ;

  
  // const API_URL =  "http://localhost:5001" ;


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
    } catch (err) {
      console.error("Fetch error:", err);
    }
    finally {
      setLoading(false); // ✅ stop loading
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
     {loading ? (
          <p className="text-lg font-semibold">Loading...</p> // ✅ loading text
        ) : (
          <table className="w-full border border-collapse" style={{ width: "75%", backgroundColor: "#fff" }}>
            <thead>
              <tr className="bg-gray-100" style={{ backgroundColor: "#1a7a75", color: "#fff", fontSize: "1rem" }}>
                <th className="border p-2">Process</th>
                <th className="border p-2">Issued Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
                <th className="border p-2">Processing Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
                <th className="border p-2">Received Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
                <th className="border p-2">Loss Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
                <th className="border p-2">Scrap Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
                <th className="border p-2">Dust Wt <span className="text-xs ps-2 text-white-700">(gm)</span></th>
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
                    <td className="border p-2" style={{ color: "#444", fontWeight: "700" }}>{row.process}</td>
                    <td className="border p-2">{Number(row.issued_wt || 0).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.process_wt || 0).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.received_wt || 0).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.loss_wt || 0).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.scrap_wt || 0).toFixed(2)}</td>
                    <td className="border p-2">{Number(row.dust_wt || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

</div>

 

      <style jsx global>{`
        .progress-report {
          // height: 100vh;
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
