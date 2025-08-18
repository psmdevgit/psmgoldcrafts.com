"use client";


import Image from "next/image";

import React, { useState, useEffect } from "react";
import SummaryQrCard from "@/components/common/QrCard";
import { fetchcuttingData } from "@/data/crm/cutting-data";
import { ICutting } from "@/interface/table.interface";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import logo from "@/assets/PothysLogo.png"

const CuttingSummary: React.FC = () => {
  const [cuttingData, setCuttingData] = useState<ICutting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  // Fetch data on load
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await fetchcuttingData();
        setCuttingData(data);
        // setfilingData(data); // initially show all
      } catch (error) {
        console.error("Error fetching filing data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);



  // const calculateSummary = () => {
  //   const totalFilings = filingData.length;
  //   const totalIssuedWeight = filingData.reduce(
  //     (sum, item) => sum + (Number(item.issuedWeight) || 0),
  //     0
  //   );
  //   const totalReceivedWeight = filingData.reduce(
  //     (sum, item) => sum + (Number(item.receivedWeight) || 0),
  //     0
  //   );
  //   const totalFilingLoss = filingData.reduce(
  //     (sum, item) => sum + (Number(item.cuttingLoss) || 0),
  //     0
  //   );
  //   const totalProcessingWeight = filingData.reduce((sum, item) => {
  //     const received = Number(item.receivedWeight || 0);
  //     return received ? sum : sum + Number(item.issuedWeight || 0);
  //   }, 0);

  //   const filingLossPercentage = totalIssuedWeight > 0
  //     ? ((totalFilingLoss / totalIssuedWeight) * 100).toFixed(2)
  //     : "0";

  //   const receivedPercentage = totalIssuedWeight > 0
  //     ? ((totalReceivedWeight / totalIssuedWeight) * 100).toFixed(2)
  //     : "0";

  //   return [
  //       {
  //       iconClass: "fa-light fa-weight-scale",
  //       title: "Processing Weight",
  //       value: totalProcessingWeight.toFixed(2) + " g",
  //       description: "Issued but not yet received",
  //       percentageChange: "",
  //       isIncrease: true,
  //     },
  //     {
  //       iconClass: "fa-light fa-gem",
  //       title: "Cutting Issued",
  //       value: totalFilings.toString(),
  //       description: "Total Cutting jobs",
  //       percentageChange: "",
  //       isIncrease: true,
  //     },
    
  //     {
  //       iconClass: "fa-light fa-weight-scale",
  //       title: "Weight Issued",
  //       value: totalIssuedWeight.toFixed(2) + " g",
  //       description: "Total gold issued",
  //       percentageChange: "",
  //       isIncrease: true,
  //     },
  //     {
  //       iconClass: "fa-light fa-scale-balanced",
  //       title: "Weight Received",
  //       value: totalReceivedWeight.toFixed(2) + " g",
  //       description: receivedPercentage + "% of issued",
  //       percentageChange: receivedPercentage,
  //       isIncrease: true,
  //     },
  //     {
  //       iconClass: "fa-light fa-arrow-trend-down",
  //       title: "Cutting Loss",
  //       value: totalFilingLoss.toFixed(2) + " g",
  //       description: filingLossPercentage + "% of issued",
  //       percentageChange: filingLossPercentage,
  //       isIncrease: false,
  //     },
  //   ];
  // };

  
  const calculateSummary = () => {
  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

  // Today's data only
  const todayData = cuttingData.filter(
    (item) =>
      item.issuedDate && item.issuedDate.split("T")[0] === today
  );

  // ---- All data (for processing weight only) ----
const totalProcessingWeight = cuttingData.reduce((sum, item) => {
    const received = Number(item.receivedWeight || 0);
    return received ? sum : sum + Number(item.issuedWeight || 0);
  }, 0);

  // ---- Today’s calculations ----
  const totalFilings = todayData.length;
  const totalIssuedWeight = todayData.reduce(
    (sum, item) => sum + (Number(item.issuedWeight) || 0),
    0
  );
  const totalReceivedWeight = todayData.reduce(
    (sum, item) => sum + (Number(item.receivedWeight) || 0),
    0
  );
  const totalFilingLoss = todayData.reduce(
    (sum, item) => sum + (Number(item.cuttingLoss) || 0),
    0
  );

  const filingLossPercentage =
    totalIssuedWeight > 0
      ? ((totalFilingLoss / totalIssuedWeight) * 100).toFixed(2)
      : "0";

  const receivedPercentage =
    totalIssuedWeight > 0
      ? ((totalReceivedWeight / totalIssuedWeight) * 100).toFixed(2)
      : "0";

  return [
    {
      iconClass: "fa-light fa-weight-scale",
      title: "Processing Weight",
      value: totalProcessingWeight.toFixed(2) + " g",
      description: "Issued but not yet received (All Time)",
      percentageChange: "",
      isIncrease: true,
    },
    {
      iconClass: "fa-light fa-gem",
      title: "Cutting Issued",
      value: totalFilings.toString(),
      description: "Today’s Cutting jobs",
      percentageChange: "",
      isIncrease: true,
    },
    {
      iconClass: "fa-light fa-weight-scale",
      title: "Weight Issued",
      value: totalIssuedWeight.toFixed(2) + " g",
      description: "Today’s gold issued",
      percentageChange: "",
      isIncrease: true,
    },
    {
      iconClass: "fa-light fa-scale-balanced",
      title: "Weight Received",
      value: totalReceivedWeight.toFixed(2) + " g",
      description: receivedPercentage + "% of today’s issued",
      percentageChange: receivedPercentage,
      isIncrease: true,
    },
    {
      iconClass: "fa-light fa-arrow-trend-down",
      title: "Cutting Loss",
      value: totalFilingLoss.toFixed(2) + " g",
      description: filingLossPercentage + "% of today’s issued",
      percentageChange: filingLossPercentage,
      isIncrease: false,
    },
  ];
};

  const summaryData = calculateSummary();

  return (
    <div className="w-full h-[100vh] summmary-body flex flex-col items-center justify-start bg-white p-4 overflow-auto" >
      {/* Title */}
    
      <div className="flex flex-row sm:flex-col items-center justify-between w-full ">
        {/* Desktop logo (hidden on small screens) */}
        <Image
          src={logo}
          alt="logo"
          priority
          width={100}
          height={20}
          style={{
            width: "150px",
            height: "auto",
            maxHeight: "100px",
            objectFit: "contain",
            marginBottom: "10px",
          }}
          className="main-logo hidden sm:block "
        />

        <h1
          className="font-bold title"
          style={{ color: "#1A7A75" }}
        >
          Cutting Summary
        </h1>

        {/* Mobile logo (only visible on small screens) */}
        <Image
          src={logo}
          alt="logo"
          priority
          width={200}
          height={20}
          style={{
            width: "100px",
            height: "auto",
            maxHeight: "70px",
            objectFit: "contain",
            marginBottom: "10px",
          }}
          className="main-logo-mobile block sm:hidden"
        />
      </div>





   

      {/* Summary Cards */}
    <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 summary-card gap-0 sm:gap-4 mt-1 sm:mt-5">

        {/* {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading cutting data...
          </div>
        ) : (
          summaryData.map((item, index) => (
            <div key={index}>
              <SummarySingleCard {...item} />
            </div>
          ))
        )} */}

         {loading ? (
  <div className="col-span-full text-center py-8 text-gray-500">
    Loading Cutting data...
  </div>
) : (
  <>
    {/* Row 1 - Processing Weight */}
    <div className="w-full max-w-7xl grid grid-cols-1 ">
      <SummaryQrCard {...summaryData[0]} />
    </div>

    {/* ✅ Row 2 - Today Label */}
    <div className="w-full text-center ">
      <span className="text-base font-bold text-gray-700">Today</span>
    </div>

    {/* ✅ Row 3 - Other 4 cards */}
 {/* Row 3 - Other 4 cards */}
<div className="w-full max-w-7xl grid grid-cols-1 gap-2">
  {summaryData.slice(1).map((item, index) => (
    <SummaryQrCard key={index} {...item} />
  ))}
</div>
  </>
)}

      </div>

      <style jsx>{`
  .main-logo {
    transition: all 0.3s ease;
  }

  @media (max-width: 768px) {
    .main-logo {
      width: 120px !important;
      max-height: 30px !important;
    }

    .title{
    font-size:1.1rem;}
  }

  .summmary-body {
    // padding-top: 100px;
    background-color: #fff;
  }

  @media (max-width: 768px) {
    .summmary-body {
      padding-top: 0px;
    }
  }
`}</style>



    </div>
  );
};

export default CuttingSummary;
