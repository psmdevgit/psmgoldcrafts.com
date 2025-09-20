
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layouts/sidebar/DashBoardSidebar";
import Header from "@/components/layouts/header/DashboardHeader";






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
        <main className="flex-2 overflow-y-auto p-6 bg-gray-50 main">
          {children}
        </main>
      </div>

       <style jsx global>{`
        .main {
          height: 100vh;
          padding-top: 75px;
          width: 87%;
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

