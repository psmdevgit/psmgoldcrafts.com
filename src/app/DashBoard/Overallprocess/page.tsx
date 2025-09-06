"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { radians } from "pdf-lib";

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

interface ProcessDetailRow {
  Name?: string;
  [key: string]: any; // Allow dynamic fields like casting_loss, loss, scrap_loss
}

const LOSS_FIELD_MAP: Record<string, string> = {
  casting: "casting_loss",
  filing: "loss",
  polishing: "polish_loss",
};

const ISSUED_FIELD_MAP: Record<string, string> = {
  casting: "Issued_weight",
  filing: "Issued_weight",
  grinding: "Issued_Weight__c",
  setting: "Issued_Weight__c",  
  polishing: "Issued_Weight__c",
  dull: "Issued_Weight__c",
  plating: "Issued_Weight__c",  
  cutting: "Issued_Weight__c",
};

const RECEIVED_FIELD_MAP: Record<string, string> = {
  casting: "Received_Weight",
  filing: "Received_Weight",
  grinding: "Received_Weight__c",
  setting: "Returned_weight__c",  
  polishing: "Received_Weight__c",
  dull: "Returned_weight__c",
  plating: "Returned_Weight__c",  
  cutting: "Returned_weight__c",
};

const ISSUED_DATE_FIELD_MAP: Record<string, string> = {
  casting: "Issued_Date",
  filing: "Issued_Date",
  grinding: "Issued_Date__c",
  setting: "Issued_Date__c",  
  polishing: "Issued_Date__c",
  dull: "Issued_Date__c",
  plating: "Issued_Date__c",  
  cutting: "Issued_Date__c",
};

const RECEIVED_DATE_FIELD_MAP: Record<string, string> = {
  casting: "Received_Date",
  filing: "Received_Date",
  grinding: "Received_Date__c",
  setting: "Received_Date__c",  
  polishing: "Received_Date__c",
  dull: "Received_Date__c",
  plating: "Received_Date__c",  
  cutting: "Received_Date__c",
};
const STATUS_FIELD_MAP: Record<string, string> = {
  casting: "status",
  filing: "Status",
  grinding: "status__c",
  setting: "status__c",  
  polishing: "status__c",
  dull: "status__c",
  plating: "Status__c",  
  cutting: "Status__c",
};
const getLossValue = (row: ProcessDetailRow, process: string) => {
  const lossField = LOSS_FIELD_MAP[process.toLowerCase()];
  return row[lossField] ?? 0;
};
const getIssuedValue = (row: ProcessDetailRow, process: string) => {
  const IssuedField = ISSUED_FIELD_MAP[process.toLowerCase()];
  return row[IssuedField] ?? 0;
};
const getReceivedValue = (row: ProcessDetailRow, process: string) => {
  const RecievedField = RECEIVED_FIELD_MAP[process.toLowerCase()];
  return row[RecievedField] ?? 0;
};
const getIssuedDate = (row: ProcessDetailRow, process: string) => {
  const IssuedDateField = ISSUED_DATE_FIELD_MAP[process.toLowerCase()];
  return row[IssuedDateField] ?? 0;
};
const getReceivedDate = (row: ProcessDetailRow, process: string) => {
  const RecievedDateField = RECEIVED_DATE_FIELD_MAP[process.toLowerCase()];
  return row[RecievedDateField] ?? 0;
};
const getStatus = (row: ProcessDetailRow, process: string) => {
  const StatusField = STATUS_FIELD_MAP[process.toLowerCase()];
  return row[StatusField] ?? 0;
};


export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState<ProcessRow[]>([]);
  const [fromDate, setFromDate] = useState(getStartOfYear);
  const [toDate, setToDate] = useState(getToday());
  const [loading, setLoading] = useState(false);

  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ProcessDetailRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const API_URL = "https://erp-server-r9wh.onrender.com";

  // Fetch summary
  const fetchSummary = async () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        alert("From Date cannot be greater than To Date");
        setFromDate(getStartOfYear());
        return;
      }
    }

    const query = `${API_URL}/api/process-summary?fromDate=${fromDate}&toDate=${toDate}`;
    setLoading(true);
    try {
      const res = await fetch(query);
      const result = await res.json();
      if (!result.success) {
        console.error("Error fetching summary:", result.message);
        return;
      }
      setSummaryData(result.data);
    } catch (err) {
      console.error("Summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for a process
  const fetchDetails = async (processName: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/${processName}`);
      const result = await res.json();
      if (!result.success) {
        console.error("Error fetching details:", result.message);
        setDetailData([]);
        return;
      }
      setDetailData(result.data);
      console.log(processName ," : ",result.data);
    } catch (err) {
      console.error("Detail fetch error:", err);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle click on process
  const handleProcessClick = (processName: string) => {
    if (selectedProcess === processName) {
      // Toggle off
      setSelectedProcess(null);
      setDetailData([]);
    } else {
      // Show details for new process
      setSelectedProcess(processName);
      fetchDetails(processName);
    }
  };

  // Add this filtering logic
const filteredDetailData = detailData.filter((item) => {
  const issueDate = getIssuedDate(item, selectedProcess || "") || null;
  const receivedDate = getReceivedDate(item, selectedProcess || "") || null;

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  const issue = issueDate ? new Date(issueDate) : null;
  const receive = receivedDate ? new Date(receivedDate) : null;

  // If no dates are available, include
  if (!issue && !receive) return true;

  const dateToCheck = receive || issue;
  if (!dateToCheck) return true;

  if (from && dateToCheck < from) return false;
  if (to && dateToCheck > to) return false;
  return true;
});


  useEffect(() => {
    fetchSummary();
  }, [fromDate, toDate]);

  return (
    <div className="p-4 progress-report">
      <h1 className="text-xl font-bold mb-4">Process Summary</h1>

      {/* Date Filters */}
      <div
        className="flex justify-center items-center gap-8 mb-4 p-2"
        style={{ backgroundColor: "#eee", width: "50%", margin: "auto", borderRadius:"10px" }}
      >
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

      {/* Summary Table */}
      <div
        className="mt-5 p-5 overflow-x-auto tablediv"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#eee",
          borderRadius: "20px",
        }}
      >
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <table
            className="w-full border border-collapse"
            style={{ width: "75%", backgroundColor: "#fff" }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#1a7a75",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <th className="border p-2">Process</th>
                <th className="border p-2">Issued Wt (gm)</th>
                <th className="border p-2">Processing Wt (gm)</th>
                <th className="border p-2">Received Wt (gm)</th>
                <th className="border p-2">Loss Wt (gm)</th>
                <th className="border p-2">Scrap Wt (gm)</th>
                <th className="border p-2">Dust Wt (gm)</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                summaryData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`text-center ${
                      selectedProcess === row.process ? "bg-gray-300" : ""
                    }`}
                  >
                    <td
                      className="border p-2 cursor-pointer text-blue-630 underline font-bold"
                      onClick={() => handleProcessClick(row.process)}
                    >
                      {row.process}
                    </td>
                    <td className="border p-2">
                      {Number(row.issued_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.process_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.received_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.loss_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.scrap_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.dust_wt || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Table Appears Below Summary Table */}
      {selectedProcess && (
        <div className="mt-2 p-4" style={{    
          backgroundColor: "#eee",
          borderRadius: "20px",}}>

          <h2 className="text-lg font-bold mb-3 text-center">
            Details for: {selectedProcess}
          </h2>
          {detailLoading ? (
            <p className="text-center font-semibold">Loading details...</p>
          ) : 
          filteredDetailData.length === 0 ? (
            <p className="text-center text-gray-500">No details found</p>
          ) : (
            <table
              className="w-full border border-collapse"
              style={{ width: "75%", margin: "auto", backgroundColor: "#fff" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#EDB652",
                    color: "#000",
                    fontSize: ".8rem",
                  }}
                >
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Issued Wt (gm)</th>
                  <th className="border p-2">Received Wt (gm)</th>
                  <th className="border p-2">Casting Loss</th>    
                  <th className="border p-2">Issued Date</th>
                  <th className="border p-2">Received Date</th>              
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailData.map((item, idx) => (
                  <tr key={idx} className="text-center" style={{fontSize:".8rem"}}>
                    <td className="border p-2">{item.Name}</td>
                    {/* <td className="border p-2">
                      {Number(item.Issued_weight || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                        {Number(getIssuedValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(item.Received_Weight || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                        {Number(getReceivedValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(item.casting_loss || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                        {Number(getLossValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">{item.Issued_Date || "-"}</td> */}
                    <td className="border p-2">
                        {formatDate(getIssuedDate(item, selectedProcess) || "-")}
                    </td>
                    {/* <td className="border p-2">{item.Received_Date || "-"}</td> */}
                    <td className="border p-2">
                        {formatDate(getReceivedDate(item, selectedProcess) || "-")}
                    </td>
                    {/* <td className="border p-2">{item.status || "-"}</td> */}
                    <td className="border p-2">
                        {(getStatus(item, selectedProcess) || "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx global>{`
        .progress-report {
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

