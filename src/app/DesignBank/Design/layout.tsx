"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layouts/sidebar/DashBoardSidebar";
import Header from "@/components/layouts/header/DashboardHeader";
import  InventoryUpdateForm from "@/src/app/Inventory/page";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Body */}
        <main className="flex-2 overflow-y-auto p-6 bg-gray-100 main" style={{background:"white"}} >
          {children}
        </main>
      </div>

           <style jsx>{`
        .main {
          height: 100vh;
          padding-top: 80px;
          width: 85%;
          margin-left: auto;
          margin-right: 0;
        }
     
        @media (max-width: 768px) {
          .main {
            width: 100%;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};


export default Layout;

