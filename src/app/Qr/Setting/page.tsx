"use client";


import Image from "next/image";

import React, { useState, useEffect } from "react";
import SummarySingleCard from "@/components/common/SummarySingleCard";
import { fetchSettingData } from "@/data/crm/setting-data";
import { ISetting } from "@/interface/table.interface";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import logo from "@/assets/PothysLogo.png"

const FilingSummary: React.FC = () => {
  const [filingData, setFilingData] = useState<ISetting[]>([]);
  // const [filingData, setfilingData] = useState<ICasting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  // const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Initialize default date range on mount
  // useEffect(() => {
  //   const now = new Date();
  //   const startOfYear = new Date(now.getFullYear(), 0, 1);
  //   setCustomStartDate(startOfYear);
  //   setCustomEndDate(now);
  // }, []);

  // Fetch data on load
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await fetchSettingData();
        setFilingData(data);
        // setfilingData(data); // initially show all
      } catch (error) {
        console.error("Error fetching filing data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Apply filter when both dates are selected
  // useEffect(() => {
  //   if (customStartDate && customEndDate) {
  //     const start = new Date(Date.UTC(
  //       customStartDate.getFullYear(),
  //       customStartDate.getMonth(),
  //       customStartDate.getDate(),
  //       0, 0, 0, 0
  //     ));
  //     const end = new Date(Date.UTC(
  //       customEndDate.getFullYear(),
  //       customEndDate.getMonth(),
  //       customEndDate.getDate(),
  //       23, 59, 59, 999
  //     ));

  //     const filtered = filingData.filter((item) => {
  //       const itemDate = new Date(item.issuedDate);
  //       const itemUTC = new Date(Date.UTC(
  //         itemDate.getUTCFullYear(),
  //         itemDate.getUTCMonth(),
  //         itemDate.getUTCDate(),
  //         0, 0, 0, 0
  //       ));
  //       return itemUTC >= start && itemUTC <= end;
  //     });

  //     setfilingData(filtered);
  //   }
  // }, [customStartDate, customEndDate, filingData]);

  const calculateSummary = () => {
    const totalFilings = filingData.length;
    const totalIssuedWeight = filingData.reduce(
      (sum, item) => sum + (Number(item.issuedWeight) || 0),
      0
    );
    const totalReceivedWeight = filingData.reduce(
      (sum, item) => sum + (Number(item.receivedWeight) || 0),
      0
    );
    const totalFilingLoss = filingData.reduce(
      (sum, item) => sum + (Number(item.lossWeight) || 0),
      0
    );
    const totalProcessingWeight = filingData.reduce((sum, item) => {
      const received = Number(item.receivedWeight || 0);
      return received ? sum : sum + Number(item.issuedWeight || 0);
    }, 0);

    const filingLossPercentage = totalIssuedWeight > 0
      ? ((totalFilingLoss / totalIssuedWeight) * 100).toFixed(2)
      : "0";

    const receivedPercentage = totalIssuedWeight > 0
      ? ((totalReceivedWeight / totalIssuedWeight) * 100).toFixed(2)
      : "0";

    return [
      {
        iconClass: "fa-light fa-gem",
        title: "Setting Issued",
        value: totalFilings.toString(),
        description: "Total Setting jobs",
        percentageChange: "",
        isIncrease: true,
      },
      {
        iconClass: "fa-light fa-weight-scale",
        title: "Processing Weight",
        value: totalProcessingWeight.toFixed(2) + " g",
        description: "Issued but not yet received",
        percentageChange: "",
        isIncrease: true,
      },
      {
        iconClass: "fa-light fa-weight-scale",
        title: "Weight Issued",
        value: totalIssuedWeight.toFixed(2) + " g",
        description: "Total gold issued",
        percentageChange: "",
        isIncrease: true,
      },
      {
        iconClass: "fa-light fa-scale-balanced",
        title: "Weight Received",
        value: totalReceivedWeight.toFixed(2) + " g",
        description: receivedPercentage + "% of issued",
        percentageChange: receivedPercentage,
        isIncrease: true,
      },
      {
        iconClass: "fa-light fa-arrow-trend-down",
        title: "Setting Loss",
        value: totalFilingLoss.toFixed(2) + " g",
        description: filingLossPercentage + "% of issued",
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
          Setting Summary
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





      {/* Custom Date Filter */}
      {/* <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="text-sm font-medium">Select Date Range:</div>
        <div className="flex items-center gap-2">
          <DatePicker
            selected={customStartDate}
            onChange={(date) => setCustomStartDate(date)}
            selectsStart
            startDate={customStartDate}
            endDate={customEndDate}
            placeholderText="From Date"
            className="px-2 py-1 text-sm border rounded"
          />
          <span>to</span>
          <DatePicker
            selected={customEndDate}
            onChange={(date) => setCustomEndDate(date)}
            selectsEnd
            startDate={customStartDate}
            endDate={customEndDate}
            minDate={customStartDate}
            placeholderText="To Date"
            className="px-2 py-1 text-sm border rounded"
          />
        </div>
      </div> */}

      {/* Summary Cards */}
    <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 summary-card gap-0 sm:gap-4 mt-0 sm:mt-5">

        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading filing data...
          </div>
        ) : (
          summaryData.map((item, index) => (
            <div key={index}>
              <SummarySingleCard {...item} />
            </div>
          ))
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
    padding-top: 100px;
    background-color: #d7e7e7;
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

export default FilingSummary;
