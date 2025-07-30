'use client';
import Wrapper from "@/components/layouts/DefaultWrapper";
import DealsMainArea from "@/components/dashboard/dashboardMainArea";
import FilingData from "@/components/Filing/FilingSummary";
import GrindingData from "@/components/Grinding/GrindingSummary";
import PolishingData from "@/components/Polishing/PolishingSummary";
import SettingData from "@/components/Setting/SettingSummary";
import CuttingData from "@/components/Cutting/CutiingSummary";
import PlatingData from "@/components/Plating/PlatingSummary";
import DullData from "@/components/Dull/DullSummary";
import React from "react";

const DealsMain = () => {
  return (
    <Wrapper>
      <div className="text-center mb-4">
        <h1 style={{textAlign:"center"}}>Current Process</h1>
      </div>
        <h1>Casting </h1>
      <DealsMainArea />
       <h1>Filing </h1>
      <FilingData />
      <h1>Grinding</h1>
      <GrindingData/>
       <h1>Setting</h1>
     <SettingData/>
      <h1>Polishing</h1>
     <PolishingData/>
    <h1>Dull</h1>
     <DullData/>
      <h1>Plating</h1>
    <PlatingData/>
     <h1>Cutting</h1>
     <CuttingData/>

<style jsx global>{`
        h1 {
          color: #1a7a75;
          font-style: -moz-initial;
          margin-top: 20px;
          font-weight: 600;
         
        }
      `}</style>
    </Wrapper>
  );
};

export default DealsMain;
