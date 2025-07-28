"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BackToTop from "@/common/BackToTop/BackToTop";
import Preloader from "@/common/Preloader/Preloader";
import DashboardFooter from "./footer/FooterOne";
import DashboardHeader from "./header/DashboardHeader";
import DashBoardSidebar from "./sidebar/DashBoardSidebar";
import useGlobalContext from "@/hooks/use-context"
// import P1 from '../../assets/O6YDMS0.jpg';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const { theme } = useGlobalContext()||{ theme: 'light' };
  const pathName = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(loadingTimeout);
  }, []);

  const renderHeader = () => {
    switch (pathName) {
      default:
        return <DashboardHeader />;
    }
  };

  const renderFooter = () => {
    switch (pathName) {
      default:
        return <DashboardFooter />;
    }
  };

  return (
    <>
      <div
        // className={`page__full-wrapper ${theme === "dark" ? "dark" : "light"}`}
             className="page__full-wrapper "
      >
        <DashBoardSidebar />
<div
  className="page__body-wrapper "

>

          {isLoading ? (
            <Preloader />
          ) : (
            <>
              <BackToTop />
              {renderHeader()}
              {children}
              {renderFooter()}
            </>
          )}
        </div>
      </div>

         <style jsx>{`
  .page__full-wrapper {
    display: flex;
    min-height: 100vh;
    background-color: transparent;
  }

  .page__body-wrapper {
    flex: 1;
    background-color: transparent;
  }

  /* Sidebar styles */
  :global(.main-sidebar-header),
  :global(.main-sidebar),
  :global(.sidebar),
  :global(.sidebar .nav),
  :global(.sidebar .nav ul),
  :global(.sidebar .nav li),
  :global(.sidebar .nav li a) {
    background-color: #1a7a75 !important;
    border: none !important;
    outline: none !important;
    color: white !important; /* Ensure text color is white */
  }

  /* Optional: Set hover/active styles for nav links */
  :global(.sidebar .nav li a:hover),
  :global(.sidebar .nav li a.active) {
    color: #fff !important;
    background-color: #166a67 !important; /* Slightly darker shade on hover/active */
  }

  /* Optional: Arrow (submenu toggle) color if using icons */
  :global(.sidebar .nav li a svg),
  :global(.sidebar .nav li a i) {
    color: white !important;
  }

  /* Header and footer transparent */
  :global(.dashboard-header),
  :global(.dashboard-footer) {
    background-color: transparent !important;
  }
`}</style>


    </>
  );
};

export default Wrapper;
