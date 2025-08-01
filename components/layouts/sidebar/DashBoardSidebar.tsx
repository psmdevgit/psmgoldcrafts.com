"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
//import sidebarMainLogo from "../../../assets/needhagoldlogo.png";
import sidebarMainLogo from "../../../assets/PothysLogo.png";
import sidebarDarkLogo from "../../../public/assets/images/logo/logo-white.svg";
import useGlobalContext from "@/hooks/use-context";
// import sidebarImg from "../../../public/assets/images/bg/side-bar.png";
import sidebarData from "@/data/sidebar-data";
import { usePathname } from "next/navigation";

const DashBoardSidebar = () => {
  const context = useGlobalContext();
  // Add a null check or provide default values
  const { isCollapse = false, setIsCollapse = () => {} } = context || {};
  //const { isCollapse, setIsCollapse } = useGlobalContext();
  const [linkId, setlinkId] = useState<number | null>(null);
  const [linkIdTwo, setlinkIdTwo] = useState<number | null>(null);
  const [linkIdThree, setlinkIdThree] = useState<number | null>(null);
  const [linkIdFour, setlinkIdFour] = useState<number | null>(null);
  const pathName = usePathname(); // Current route

  // Utility function to handle collapse behavior for screens with max-width: 1199px
  const handleCollapse = (shouldCollapse: boolean) => {
    if (window.matchMedia("(max-width: 1199px)").matches) {
      setIsCollapse(shouldCollapse);
    }
  };

  const handleClick = (id: number) => {
    if (linkId === id) {
      setlinkId(null);
      handleCollapse(true);
    } else {
      setlinkId(id);
      setlinkIdTwo(null);
      setlinkIdThree(null);
      setlinkIdFour(null);
      handleCollapse(true); // Expand when opening
    }
  };

  const handleClickTwo = (id: number) => {
    if (linkIdTwo === id) {
      setlinkIdTwo(null);
      handleCollapse(true); // Collapse when closing
    } else {
      setlinkIdTwo(id);
      setlinkIdThree(null);
      setlinkIdFour(null);
      handleCollapse(true); // Expand when opening
    }
  };

  const handleClickThree = (id: number) => {
    if (linkIdThree === id) {
      setlinkIdThree(null);
      handleCollapse(true); // Collapse when closing
    } else {
      setlinkIdThree(id);
      setlinkIdFour(null);
      handleCollapse(true); // Expand when opening
    }
  };

  const handleClickFour = (id: number) => {
    if (linkIdFour === id) {
      setlinkIdFour(null);
      handleCollapse(true); // Collapse when closing
    } else {
      setlinkIdFour(id);
      handleCollapse(true); // Expand when opening
    }
  };

  // UseEffect to find and set the active menu based on the current path
  useEffect(() => {
    const findLayerIds = () => {
      let foundFirstLayerId = null;
      let foundSecondLayerId = null;
      let foundThirdLayerId = null;

      // Iterate through sidebarData to find the object that matches the pathName
      sidebarData.forEach((category) => {
        category.items.forEach((item) => {
          // Check if the current pathName matches the link of the first level
          if (item.link === pathName) {
            foundFirstLayerId = item.id; // First Layer ID
            foundSecondLayerId = null; // Reset second-level ID
            foundThirdLayerId = null; // Reset third-level ID
          } else if (item.subItems) {
            // Check within subItems recursively for the second layer
            item.subItems.forEach((subItem, subItemIndex) => {
              if (subItem.link === pathName) {
                foundFirstLayerId = item.id; // First Layer ID
                foundSecondLayerId = subItemIndex; // Second Layer ID
                foundThirdLayerId = null; // Reset third-level ID
              } else if (subItem.subItems) {
                subItem.subItems.forEach((thirdSubMenu, thirdSubIndex) => {
                  if (thirdSubMenu.link === pathName) {
                    foundFirstLayerId = item.id; // First Layer ID
                    foundSecondLayerId = subItemIndex; // Second Layer ID
                    foundThirdLayerId = thirdSubIndex; // Third Layer ID
                  }
                });
              }
            });
          }
        });
      });

      // Set the found ids in state
      setlinkId(foundFirstLayerId);
      setlinkIdTwo(foundSecondLayerId);
      setlinkIdThree(foundThirdLayerId);
    };

    // Call the function to find the matching object when pathName changes
    findLayerIds();
  }, [pathName]); // Re-run the effect whenever pathName changes

  return (
    <>
      <div
        // className={`app-sidebar ${isCollapse ? "collapsed close_sidebar " : ""}  `}
        className="app-sidebar"
>
        <div className="main-sidebar-header max-w-[300px] overflow-hidden " style={{background:"#1a7a75",border:"none"}} >
         
            <Image
              className="main-logo w-200 h-[85px]"
              src={sidebarMainLogo}
              priority
              alt="logo"
              width={200}
              height={50}
              style={{ 
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '70px'
              }}
            />
            
      
        </div>

        <div className="common-scrollbar ">
          <nav className="main-menu-container nav nav-pills flex-column sub-open mt-[80px]">
            <ul className="main-menu" style={{ display: "block" }}>
              {sidebarData.map((category) => (
                <React.Fragment key={category.id}>
                  <li className="sidebar__menu-category ">
                    <span className="category-name">{category.category}</span>
                  </li>
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className={
                        item.subItems?.length
                          ? `slide has-sub ${linkId === item.id ? "open" : ""}`
                          : ""
                      }
                    >
                      <button
                        onClick={(e) => {
                          if (!item.link || item.link === "#") {
                            e.preventDefault();
                          } else {
                            window.location.href = item.link;
                          }
                          handleClick(item.id);
                        }}
                        className={`sidebar__menu-item transition-all active:scale-95 ${
                          linkId === item.id ? "active" : ""
                        }`}
                      >
                        {item.icon && (
                          <div className="side-menu__icon">
                            <i className={item.icon}></i>
                          </div>
                        )}
                        <span className="sidebar__menu-label">
                          {item.label}
                        </span>
                        {item.subItems && (
                          <i className="fa-regular fa-angle-down side-menu__angle"></i>
                        )}
                      </button>

                      {item.subItems && (
                        <ul
                          className={
                            linkId === item.id
                              ? `sidebar-menu child1 active submenu-visible`
                              : `sidebar-menu child1`
                          }
                          style={{
                            display: linkId === item.id ? "block" : "none",
                          }}
                        >
                          {item.subItems.map((subOne, index) => (
                            <li
                              key={index}
                              className={`slide has-sub ${
                                linkIdTwo === index ? "open" : ""
                              }`}
                            >
                              <button
                                onClick={() => {
                                  if (subOne.link) {
                                    window.location.href = subOne.link;
                                  }
                                  handleClickTwo(index);
                                }}
                                // className={`sidebar__menu-item transition-all active:scale-95 ${
                                //   linkIdTwo === index ? "active" : ""
                                // }`}

                                className={`sidebar__menu-item transition-all active:scale-95 ${
                                  pathName === subOne.link ? "text-[#ae100d]" : ""
                                }`}


                              >
                                {subOne.label}



                                {subOne.subItems && (
                                  <i className="fa-regular fa-angle-down side-menu__angle"></i>
                                )}
                              </button>
                              {subOne.subItems && (
                                <ul
                                  className="sidebar-menu child2"
                                  style={{
                                    display:
                                      linkIdTwo === index ? "block" : "none",
                                  }}
                                >
                                  {subOne.subItems.map((subTwo, subIndex) => (
                                    <li
                                      key={subIndex}
                                      className={`slide has-sub ${
                                        linkIdThree === subIndex ? "open" : ""
                                      }`}
                                    >
                                      <button
                                        onClick={() =>
                                          handleClickThree(subIndex)
                                        }
                                        className={`sidebar__menu-item transition-all active:scale-95 ${
                                          linkIdThree === subIndex
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        {subTwo.label}
                                        {subTwo.subItems && (
                                          <i className="fa-regular fa-angle-down side-menu__angle"></i>
                                        )}
                                      </button>
                                      {subTwo.subItems && (
                                        <ul
                                          className="sidebar-menu child3"
                                          style={{
                                            display:
                                              linkIdThree === subIndex
                                                ? "block"
                                                : "none",
                                          }}
                                        >
                                          {subTwo.subItems.map(
                                            (subThree, subThreeIndex) => (
                                              <li
                                                key={subThreeIndex}
                                                className={`slide ${
                                                  subThree.subItems
                                                    ? "has-sub"
                                                    : ""
                                                }`}
                                              >
                                                <button
                                                  className={`sidebar__menu-item transition-all active:scale-95 ${
                                                    subThree.subItems
                                                      ? ""
                                                      : ""
                                                  }`}
                                                >
                                                  {subThree.label}
                                                </button>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          </nav>

<style jsx>{`
  .app-sidebar,
  .common-scrollbar,
  .main-sidebar-header {
    background-color: #1a7a75 !important;
  }





.common-scrollbar {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  /* Optional: prevent body scrolling when sidebar is open (mobile) */
  .app-sidebar {
    position: relative;
    height: 100vh;
  }

  /* Also update if using tailwind-style props directly */
  :global(.common-scrollbar) {
    height: 100vh !important;
  }
  .sidebar__menu-item {
    display: flex;
    align-items: center;
    color: white;
    transition: all 0.2s ease;
  }

  .sidebar__menu-label {
    color: white;
    margin-left: 10px;
    flex: 1;
  }

  .side-menu__icon {
    color: white;
    margin-right: 8px;
  }

  .sidebar__menu-category {
    color: white;
    font-weight: 600;
    font-size: 14px;  
    margin: 10px 20px 5px;
  }

  .sidebar__menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .sidebar__menu-item.active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .sidebar__menu-item.active .sidebar__menu-label,
  .sidebar__menu-item.active .side-menu__icon,
  .sidebar__menu-item.active .menu-arrow {
    color: white;
  }

  .menu-arrow,
  .sidebar__menu-item .fa,
  .sidebar__menu-item .ri-arrow-down-s-line,
  .sidebar__menu-item .lucide,
  .sidebar__menu-item svg {
    color: white !important;
  }

  .sidebar__menu-item ul li:hover,
  .sidebar__menu-item ul li:hover a,
  .sidebar__menu-item ul li:hover span {
    color: white !important;
  }

  /* ✅ Ensure main-sidebar-header override */
  .main-sidebar-header {
    background-color: #1a7a75 !important;
  }
     .sidebar-menu li .sidebar__menu-item {
    color: white !important;
  }

  .sidebar-menu li .sidebar__menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white !important;
  }

  /* ✅ Active submenu item */
  .sidebar-menu li .sidebar__menu-item.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: #ae100d !important;
  }

  /* ✅ Sub-submenu and arrow color fix */
  .sidebar-menu li .sidebar__menu-item.active i,
  .sidebar-menu li .sidebar__menu-item i,
  .sidebar-menu li .sidebar__menu-item svg {
      color: #ae100d !important;
  }

  
  /* Optional: Arrow rotation for open state */
  .slide.open > .sidebar__menu-item .fa-angle-down {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
  }
`}</style>





          <div
            className="sidebar__thumb sidebar-bg"
            // style={{ backgroundImage: `url(${sidebarImg.src})` }}
          >
            {/*<div className="sidebar__thumb-content">
              <p className="sidebar__thumb-title">
                Upgrade to PRO to get access all Features!
              </p>
              <Link
                href="/pro"
                className="btn btn-white-primary rounded-[50rem] w-full"
              >
                Get Pro Now!
              </Link>
              </div>*/}
          </div>
        </div>
      </div>
      {/* <div className="app__offcanvas-overlay"></div>
      <div
        onClick={() => setIsCollapse(false)}
        className={`app__offcanvas-overlay ${isCollapse ? "overlay-open" : ""}`}
      ></div> */}
    </>
  );
};

export default DashBoardSidebar;
