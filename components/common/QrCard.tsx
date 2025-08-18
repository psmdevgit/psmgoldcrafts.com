// import React from "react";

// interface CardProps {
//   iconClass: string; // Font Awesome icon class
//   title: string; // Title of the card
//   value: string | number; // Main value to display
//   description?: string; // Optional description
//   percentageChange?: string; // Optional percentage change info
//   isIncrease?: boolean; // Indicates if the change is positive or negative
// }

// const SummarySingleCard: React.FC<CardProps> = ({
//   iconClass,
//   title,
//   value,
//   description,
//   percentageChange,
//   isIncrease,
// }) => {
//   return (<div
//   className="card__wrapper"
//   style={{
//     backgroundColor: title === "Processing Weight" ? "#F7DEB1" : ""
//   }}
// >

//       <div className="flex items-center gap-[30px] maxSm:gap-5">
//         <div className="card__icon">
//           <span   style={{
//     backgroundColor: title === "Processing Weight" ? "#D7E7E7" : ""
//   }}>
//             <i className={iconClass}  style={{
//     color: title === "Processing Weight" ? "#1A7A75" : ""
//   }}></i>
//           </span>
//         </div>
//         <div className="card__title-wrap">
//           <h6 className="card__sub-title mb-[10px]">{title}</h6>
//           <div className="flex flex-wrap items-end gap-[10px]">
//             <h3 className="card__title mb-0">{value}</h3>
//             {description && (
//               <span className="card__desc style_two"  style={{color: title === "Processing Weight" ? "#000" : ""}}>
//                 {percentageChange && (
//                   <span
//                     className={`price-${isIncrease ? "increase" : "decrease"}`}
//                   >
//                     <i
//                       className={`fa-light ${
//                         isIncrease ? "fa-arrow-up" : "fa-arrow-down"
//                       }`}
//                     ></i>{" "}
//                     {percentageChange}
//                   </span>
//                 )}{" "}
//                 {description}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SummarySingleCard;

import React from "react";

interface CardProps {
  iconClass: string; 
  title: string; 
  value: string | number; 
  description?: string; 
  percentageChange?: string; 
  isIncrease?: boolean; 
}

const SummaryQrCard: React.FC<CardProps> = ({
  iconClass,
  title,
  value,
  description,
  percentageChange,
  isIncrease,
}) => {
  const isProcessing = title === "Processing Weight";

  return (
    <div
      className="card__wrapper"
      style={{
        backgroundColor: isProcessing ? "#F7DEB1" : "",
      }}
    >
      <div className="flex items-center gap-[30px] maxSm:gap-5">
        <div className="card__icon">
          <span
            style={{
              backgroundColor: isProcessing ? "#D7E7E7" : "",
            }}
          >
            <i
              className={iconClass}
              style={{
                color: isProcessing ? "#1A7A75" : "",
              }}
            ></i>
          </span>
        </div>
        <div className="card__title-wrap">
          <h6 className="card__sub-title mb-[10px]">{title}</h6>
          <div className="flex flex-wrap items-end gap-[10px]">
            <h3 className="card__title mb-0">{value}</h3>
            {description && (
              <span
                className="card__desc style_two"
                style={{ color: isProcessing ? "#000" : "" }}
              >
                {percentageChange && (
                  <span
                    className={`price-${isIncrease ? "increase" : "decrease"}`}
                  >
                    <i
                      className={`fa-light ${
                        isIncrease ? "fa-arrow-up" : "fa-arrow-down"
                      }`}
                    ></i>{" "}
                    {percentageChange}
                  </span>
                )}{" "}
                {description}
              </span>
            )}
          </div>

          {/* ✅ Show Today label only for the 4 non-processing cards */}
          {/* {!isProcessing && (
            <span className="text-xs text-gray-500 mt-1 block">Today</span>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default SummaryQrCard;
