// "use client";
// import { useState, useEffect } from 'react';
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import QRCode  from 'qrcode';
// import noimage from "../../../../../assets/no.png";

// import { useRouter } from "next/navigation";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import * as XLSX from 'xlsx';
// import Image from 'next/image';
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// import { Eye, Printer, Trash2 } from "lucide-react";


// interface PartyLedger {
//   id: string;
//   name: string;
//   code: string;
// }

// interface Order {
//   id: string;
//   orderNo: string;
// }

// interface OrderModel {
//   id: string;
//   modelName: string;
//   imageUrl: string | null;
// }

// // Updated interface with consistent image handling
// interface TaggingModel {
//   modelId: string;
//   modelName: string;
//   uniqueNumber: number;
//   imageUrl: string | null;
//   imageData: string | null; // Base64 image data
//   grossWeight: number;
//   netWeight: number;
//   stoneWeight: number;
//   stoneCharges: number;
// }

// // Interface for submitted tagged items
// interface SubmittedTaggedItem {
//   id: string;
//   modelDetails: string;
//   Model_Unique_Number__c: string;
//   Gross_Weight__c: string;
//   Net_Weight__c: string;
//   Stone_Weight__c: string;
//   Stone_Charge__c: string;
//   PDF_URL__c?: string;
//   pdfUrl?: string;
// }

// const NewTagging = () => {

  
//         const router = useRouter();
  
//   const [partyLedgers, setPartyLedgers] = useState<PartyLedger[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedParty, setSelectedParty] = useState<string>('');
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isLoadingOrders, setIsLoadingOrders] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<string>('');
//   const [orderModels, setOrderModels] = useState<OrderModel[]>([]);
//   const [selectedModels, setSelectedModels] = useState<TaggingModel[]>([]);
//   const [modelCounts, setModelCounts] = useState<Record<string, number>>({});
//   const [isLoadingModels, setIsLoadingModels] = useState(false);
//   const [submittedItems, setSubmittedItems] = useState<SubmittedTaggedItem[]>([]);
//   const [isSubmittingModels, setIsSubmittingModels] = useState(false);
//   const [isSubmittingTagging, setIsSubmittingTagging] = useState(false);

//   // const [previewData, setPreviewData] = useState<{ model: TaggingModel; pcIndex: number } | null>(null);
//   // instead of storing row data snapshot
// const [previewData, setPreviewData] = useState<{ modelIndex: number; pcIndex: number } | null>(null);


//   const apiBaseUrl = "https://kalash.app" ;

//   const imageUrl = "https://psmport.pothysswarnamahalapp.com/FactoryModels/";

  
//   // const apiBaseUrl = "http://192.168.5.62:8080" ;
  
//   // const apiBaseUrl = "http://localhost:4001" ;













//   return (
// <div className="flex justify-center gap-2">
//   {/* Form container */}
//   <div className="max-w-6xl p-6 px-10 mx-auto bg-white rounded-lg shadow-md mt-[100px]">
//     <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">New Tagging</h1>

//     <form
//       className=" max-w-6xl mx-auto"
//       onSubmit={(e) => {
//         e.preventDefault();
//         handleSubmitTagging();
//       }}
//     >
//       {/* Party & Order Selection */}
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//         {/* Party */}
//         <div className="form-group">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Select Party</label>
//           <Select
//             onValueChange={(value) => {
//               const selectedParty = partyLedgers.find((party) => party.code === value);
//               if (selectedParty) {
//                 setSelectedParty(selectedParty.code);
//                 setSelectedOrder('');
//                 setSelectedModels([]);
//                 setSubmittedItems([]);
//               }
//             }}
//           >
//             <SelectTrigger className="w-full bg-white border border-gray-200">
//               <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Party'} />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               {partyLedgers.length > 0 ? (
//                 partyLedgers.map((party) => (
//                   <SelectItem key={party.id} value={party.code} className="hover:bg-gray-100">
//                     {party.name}
//                   </SelectItem>
//                 ))
//               ) : (
//                 <SelectItem value="no-data" disabled>
//                   {isLoading ? 'Loading...' : 'No parties available'}
//                 </SelectItem>
//               )}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Order */}
//         <div className="form-group relative z-10">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
//           <Select
//             value={selectedOrder}
//             onValueChange={(value) => setSelectedOrder(value)}
//             disabled={!selectedParty || isLoadingOrders}
//           >
//             <SelectTrigger className="w-full bg-white border border-gray-200">
//               <SelectValue placeholder={isLoadingOrders ? 'Loading Orders...' : 'Select Order'} />
//             </SelectTrigger>
//             <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
//               {orders.length > 0 ? (
//                 orders.map((order) => (
//                   <SelectItem key={`${order.id}-${order.orderNo}`} value={order.id} className="hover:bg-gray-100">
//                     {order.orderNo}
//                   </SelectItem>
//                 ))
//               ) : (
//                 <SelectItem value="no-data" disabled >
//                   {isLoadingOrders ? 'Loading...' : 'No orders available'}
//                 </SelectItem>
//               )}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Model Selection */}
//       {selectedOrder && (
//         <div className="space-y-4 mx-auto">
//           <div className="form-group relative z-10">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Model</label>
//             <Select onValueChange={handleModelSelection} disabled={!selectedOrder || isLoadingModels}>
//               <SelectTrigger className="w-full bg-white border border-gray-200">
//                 <SelectValue placeholder={isLoadingModels ? 'Loading Models...' : 'Select Model'} />
//               </SelectTrigger>
//               <SelectContent className="bg-white max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
//              hover:scrollbar-thumb-gray-500 ">
//                 {uniqueModels.length > 0 ? (
//                   uniqueModels.map((model, index) => (
//                     <SelectItem key={`model-${model.id}-${index}`} value={model.id} className="hover:bg-gray-100">
//                       {model.modelName}
//                     </SelectItem>
//                   ))
//                 ) : (
//                   <SelectItem value="no-data" disabled>
//                     {isLoadingModels ? 'Loading...' : 'No models available'}
//                   </SelectItem>
//                 )}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       )}

//       {/* Selected Models with Pcs Grid */}
//       {selectedModels.length > 0 && (
//         <div className="space-y-4 mx-auto">
//           <label className="block text-sm font-medium text-gray-700">Selected Models Details</label>
//           {selectedModels.map((model, index) => {
//             const stoneRate = 600; // Rs per gram

//             return (
//              <div key={model.uniqueNumber} className="border rounded-lg p-4 bg-white shadow-sm">
//   {/* Header */}
//   <div className="flex justify-between items-center mb-3">
//     <p className="font-medium text-gray-800">
//       {model.modelName}{' '}
//       <span className="ml-2 text-sm text-gray-500">#{model.uniqueNumber}</span>
//     </p>

//     <div className="flex items-center gap-2">
//       <label className="text-xs text-gray-600">Quantity</label>
//       <input
//         type="number"
//         min="1"
//         value={model.quantity || 1}
//         onChange={(e) => {
//           const qty = Math.max(1, parseInt(e.target.value || '0', 10) || 1);
//           setSelectedModels(prev => {
//             const updated = [...prev];
//             const m = { ...updated[index] };
//             const oldPcs = Array.isArray(m.pcs) ? [...m.pcs] : [];

//             // build new pcs preserving existing where possible
//             const newPcs = Array.from({ length: qty }, (_, i) => {
//               if (oldPcs[i]) return { ...oldPcs[i] };
//               return { stoneWeight: 0, netWeight: 0, grossWeight: 0, stoneCharges: 0 };
//             });

//             m.quantity = qty;
//             m.pcs = newPcs;
//             updated[index] = m;
//             return updated;
//           });
//         }}
//         className="w-16 h-8 text-sm px-2 border border-gray-300 rounded"
//       />
//     </div>
//   </div>

//   {/* Quick Summary */}
//   <div className="mb-2 text-sm text-gray-700">
//     Total Pcs: {model.quantity || 0} / Remaining:{' '}
//     {(model.quantity || 0) - (model.pcs?.filter((p) => p.netWeight > 0 || p.stoneWeight > 0).length || 0)}
//   </div>

//   {/* Grid Table */}
//   <div className="overflow-x-auto">
//     <table className="min-w-full border border-gray-300 text-sm">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="border px-2 py-1">Stone Wt (g)</th>
//           <th className="border px-2 py-1">Net Wt (g)</th>
//           <th className="border px-2 py-1">Gross Wt</th>
     
//         </tr>
//       </thead>
//       <tbody>
//         {model.pcs?.map((pc, pcIndex) => (
//           <tr key={pcIndex}>

          

//             {/* Stone Weight */}
//             <td className="border px-2 py-1">
//               <input
//                 type="number"
//                 step="0.001"
//                 min="0"
//                 value={pc.stoneWeight}
//                 onChange={(e) => {
//                   const stoneWeight = Number(e.target.value || 0);
//                   setSelectedModels(prev => {
//                     const updated = [...prev];
//                     const m = { ...updated[index] };
//                     const pcs = m.pcs ? [...m.pcs] : [];
//                     const newPc = { ...pcs[pcIndex] };
//                     newPc.stoneWeight = stoneWeight;
//                     // recalc gross & stoneCharges
//                     newPc.grossWeight = (Number(newPc.netWeight || 0) + stoneWeight);
//                     newPc.stoneCharges = stoneWeight * (typeof stoneRate !== 'undefined' ? stoneRate : 600);
//                     pcs[pcIndex] = newPc;
//                     m.pcs = pcs;
//                     updated[index] = m;
//                     return updated;
//                   });
//                 }}
//                 className="w-full h-7 px-2 border border-gray-300 rounded"
//               />
//             </td>

//             {/* Net Weight */}
//             <td className="border px-2 py-1">
//               <input
//                 type="number"
//                 step="0.001"
//                 min="0"
//                 value={pc.netWeight}
//                 onChange={(e) => {
//                   const netWeight = Number(e.target.value || 0);
//                   setSelectedModels(prev => {
//                     const updated = [...prev];
//                     const m = { ...updated[index] };
//                     const pcs = m.pcs ? [...m.pcs] : [];
//                     const newPc = { ...pcs[pcIndex] };
//                     newPc.netWeight = netWeight;
//                     // recalc gross & keep stone charges based on current stoneWeight
//                     newPc.grossWeight = netWeight + (Number(newPc.stoneWeight || 0));
//                     newPc.stoneCharges = (Number(newPc.stoneWeight || 0)) * (typeof stoneRate !== 'undefined' ? stoneRate : 600);
//                     pcs[pcIndex] = newPc;
//                     m.pcs = pcs;
//                     updated[index] = m;
//                     return updated;
//                   });
//                 }}
//                 className="w-full h-7 px-2 border border-gray-300 rounded"
//               />
//             </td>

//             {/* Gross & Charges (display only) */}
//             <td className="border px-2 py-1 text-center bg-gray-50">
//               {(Number(pc.grossWeight || 0)).toFixed(3)}
//             </td>
               


//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>


// </div>

//             );
//           })}
//         </div>
//       )}

//       {/* Summary Table */}
//       {selectedModels.length > 0 && (
//         <div className="mt-8 mx-auto">
//           <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">Summary Table</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border border-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2 border-b text-left text-xs font-medium text-gray-500 uppercase">Sr.No</th>
//                   <th className="px-4 py-2 border-b text-left text-xs font-medium text-gray-500 uppercase">Model Name</th>
//                   <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Pcs</th>
//                   <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Net Wt (g)</th>
//                   <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Stone Wt (g)</th>
//                   <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Gross Wt (g)</th>
//                   <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Stone Charges (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedModels.map((model, index) => {
//                   const pcs = model.pcs || [];
//                   const netTotal = pcs.reduce((sum, pc) => sum + (pc.netWeight || 0), 0);
//                   const stoneTotal = pcs.reduce((sum, pc) => sum + (pc.stoneWeight || 0), 0);
//                   const grossTotal = pcs.reduce((sum, pc) => sum + (pc.grossWeight || 0), 0);
//                   const stoneChargesTotal = pcs.reduce((sum, pc) => sum + (pc.stoneCharges || 0), 0);

//                   return (
//                     <tr key={`${model.modelId}-${index}`} className="border-b hover:bg-gray-50">
//                       <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900">{model.modelName}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900 text-right">{pcs.length}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900 text-right">{netTotal.toFixed(3)}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900 text-right">{stoneTotal.toFixed(3)}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900 text-right">{grossTotal.toFixed(3)}</td>
//                       <td className="px-4 py-2 text-sm text-gray-900 text-right">{stoneChargesTotal.toFixed(2)}</td>
//                     </tr>
//                   );
//                 })}

//                 {/* Grand Total */}
//                 <tr className="bg-gray-50 font-medium">
//                   <td className="px-4 py-2 text-sm text-gray-900">Total</td>
//                   <td className="px-4 py-2 text-sm text-gray-900">{selectedModels.length} Models</td>
//                   <td className="px-4 py-2 text-sm text-gray-900 text-right">
//                     {selectedModels.reduce((sum, m) => sum + (m.pcs?.length || 0), 0)} Pcs
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-900 text-right">
//                     {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.netWeight || 0), 0), 0).toFixed(3)}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-900 text-right">
//                     {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.stoneWeight || 0), 0), 0).toFixed(3)}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-900 text-right">
//                     {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.grossWeight || 0), 0), 0).toFixed(3)}
//                   </td>
//                   <td className="px-4 py-2 text-sm text-gray-900 text-right">
//                     {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.stoneCharges || 0), 0), 0).toFixed(2)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Submit Buttons */}
     
//     </form>
//   </div>









  
// </div>

//   );
// };

// export default NewTagging;

// "use client";
// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// interface CuttingData {
//   Id: string;
//   Name: string;
//   Issued_Date_c: string;
//   Issued_Weight_c: number;
//   Returned_weight_c: number;
//   Received_Date_c: string;
//   Status_c: string;
//   Cutting_loss_c: number;
// }

// interface PouchData {
//   Id: string;
//   Name: string;
//   Order_Id_c: string;
//   Issued_Weight_Cutting_c: number;
//   Received_Weight_Cutting_c: number;
//   order?: any;
//   models?: any[];
// }

// export default function AddTagging() {
//   const searchParams = useSearchParams();
//   const cuttingId = searchParams.get("cuttingId");

//   const [cutting, setCutting] = useState<CuttingData | null>(null);
//   const [pouches, setPouches] = useState<PouchData[]>([]);
//   const [summary, setSummary] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

  
//   const apiBaseUrl = "http://localhost:4001" ;

//   useEffect(() => {
//     if (!cuttingId) return;

//     const parts = cuttingId.split("/");
//     console.log(parts);
//     if (parts.length !== 6) {
//       console.error("Invalid cuttingId format:", cuttingId);
//       return;
//     }

//     const [prefix, date, month, year, number,subnum] = parts;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `${apiBaseUrl}/api/cutting-tagging/${prefix}/${date}/${month}/${year}/${number}/${subnum}`
//         );
//         const data = await res.json();
//         if (data.success) {
//           setCutting(data.data.cutting);
//           setPouches(data.data.pouches);
//           setSummary(data.summary);
//         } else {
//           console.error("API error:", data.message);
//         }
//       } catch (err) {
//         console.error("Error fetching cutting details:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [cuttingId]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (!cutting)
//     return <div className="p-4 text-red-500">No cutting data found.</div>;

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">Add Tagging</h1>

//       {/* Cutting Info */}
//       <div className="grid grid-cols-2 gap-4 bg-gray-50 border p-4 rounded-lg shadow">
//         <div>
//           <label className="block text-sm font-medium">Cutting ID</label>
//           <input
//             type="text"
//             value={cutting.Name}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Status</label>
//           <input
//             type="text"
//             value={cutting.Status_c}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Issued Date</label>
//           <input
//             type="text"
//             value={new Date(cutting.Issued_Date_c).toLocaleDateString()}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Received Date</label>
//           <input
//             type="text"
//             value={
//               cutting.Received_Date_c
//                 ? new Date(cutting.Received_Date_c).toLocaleDateString()
//                 : "-"
//             }
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Issued Weight</label>
//           <input
//             type="text"
//             value={cutting.Issued_Weight_c ?? 0}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Returned Weight</label>
//           <input
//             type="text"
//             value={cutting.Returned_weight_c ?? 0}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Cutting Loss</label>
//           <input
//             type="text"
//             value={cutting.Cutting_loss_c ?? 0}
//             readOnly
//             className="w-full border rounded p-2 bg-gray-100"
//           />
//         </div>
//       </div>

//       {/* Summary */}
//       {summary && (
//         <div className="grid grid-cols-3 gap-4 mt-6">
//           <div className="bg-blue-100 p-4 rounded shadow">
//             <p className="text-gray-700 font-semibold">Total Pouches</p>
//             <p className="text-xl font-bold">{summary.totalPouches}</p>
//           </div>
//           <div className="bg-green-100 p-4 rounded shadow">
//             <p className="text-gray-700 font-semibold">Total Orders</p>
//             <p className="text-xl font-bold">{summary.totalOrders}</p>
//           </div>
//           <div className="bg-yellow-100 p-4 rounded shadow">
//             <p className="text-gray-700 font-semibold">Total Models</p>
//             <p className="text-xl font-bold">{summary.totalModels}</p>
//           </div>
//         </div>
//       )}

//       {/* Pouches List */}
//       <div className="mt-6">
//         <h2 className="text-lg font-semibold mb-2">Pouch Details</h2>
//         {pouches.length === 0 ? (
//           <p>No pouches found.</p>
//         ) : (
//           <table className="w-full border-collapse border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border p-2">Pouch</th>
//                 <th className="border p-2">Order</th>
//                 <th className="border p-2">Issued Weight</th>
//                 <th className="border p-2">Received Weight</th>
//                 <th className="border p-2">Models</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pouches.map((pouch) => (
//                 <tr key={pouch.Id}>
//                   <td className="border p-2">{pouch.Name}</td>
//                   <td className="border p-2">
//                     {pouch.order ? pouch.order.Name : "-"}
//                   </td>
//                   <td className="border p-2">
//                     {pouch.Issued_Weight_Cutting_c ?? 0}
//                   </td>
//                   <td className="border p-2">
//                     {pouch.Received_Weight_Cutting_c ?? 0}
//                   </td>
//                   <td className="border p-2">
//                     {pouch.models && pouch.models.length > 0
//                       ? pouch.models.length
//                       : 0}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from 'next/navigation';

interface CuttingData {
  Id: string;
  Name: string;
  Issued_Date__c: string;
  Returned_weight__c: number;
  Received_Date__c: string;
  Status__c: string;
  Quantity__c: number;
  Product__c: string;
  Order_Id__c: string;
}

export default function AddTagging() {
  const searchParams = useSearchParams();
  const cuttingId = searchParams.get("cuttingId");

  const [cutting, setCutting] = useState<CuttingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taggingId, setTaggingId] = useState("");
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  
    const router = useRouter();

  
  const apiBaseUrl = "https://kalash.app";
  
  // const apiBaseUrl = "http://localhost:4001";

  useEffect(() => {
    if (!cuttingId) return;

    const parts = cuttingId.split("/");
    if (parts.length !== 6) {
      console.error("Invalid cuttingId format:", cuttingId);
      return;
    }

    const [prefix, date, month, year, number, subnum] = parts;
    const generatedTagId = `TAG/${date}/${month}/${year}/${number}/${subnum}`;
    setTaggingId(generatedTagId);

    const fetchCutting = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${apiBaseUrl}/api/cutting-tagging/${prefix}/${date}/${month}/${year}/${number}/${subnum}`
        );
        const data = await res.json();

        if (data.success) {
          setCutting(data.data.cutting);
          setReceivedWeight(data.data.cutting.Returned_weight__c ?? 0);
          setQuantity(data.data.cutting.Quantity__c ?? 0);
        } else {
          console.error("API error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching cutting details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCutting();
  }, [cuttingId]);

//   const handleSubmit = () => {
//     if (!cutting) return;

//     const updatedData = {
//       TaggingId: taggingId,
//       Order: cutting.Order_Id__c,
//       Product: cutting.Product__c,
//       Quantity: quantity,
//       ReceivedWeight: receivedWeight,
//       IssuedDate: cutting.Issued_Date__c,
//       ReceivedDate: cutting.Received_Date__c,
//     };

//     alert(`✅ Tagging Details:
// Tagging ID: ${updatedData.TaggingId}
// Order: ${updatedData.Order}
// Product: ${updatedData.Product}
// Quantity: ${updatedData.Quantity}
// Received Weight: ${updatedData.ReceivedWeight}
// Issued Date: ${new Date(updatedData.IssuedDate).toLocaleDateString()}
// Received Date: ${new Date(updatedData.ReceivedDate).toLocaleDateString()}
// `);
//   };

const handleSubmit = async () => {
  if (!cutting) return;

  const payload = {
    cuttingId: cuttingId,
    Name: taggingId,
    product: cutting.Product__c,
    Received_weight: receivedWeight,
    quantity: quantity,
    Order_id: cutting.Order_Id__c,
    issued_date: new Date().toISOString(),   // current date/time
    received_date: new Date().toISOString(), // current date/time
  };

  try {
    const res = await fetch(`${apiBaseUrl}/api/tagging-add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Tagging inserted successfully!");  
        setTimeout(() => {
        router.push("/Departments/Tagging/Tagging_Table");
      }, 1000);    
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (error) {
    alert("⚠️ Tagging Not Submit....");
    console.error(error);
  }
};

  if (loading) return <div className="p-4">Loading...</div>;
  if (!cutting)
    return <div className="p-4 text-red-500">No cutting data found.</div>;

  return (
    <div className="p-6 flex justify-end">
      <div
        className="w-[80%] bg-white rounded-lg shadow p-6 border border-gray-200"
        style={{ marginTop: "100px" }}
      >
        <h1 className="text-xl font-bold mb-4 text-center">Tagging Details</h1>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 border p-4 rounded-lg shadow-inner">
          <div>
            <label className="block text-sm font-medium">Tagging ID</label>
            <input
              type="text"
              value={taggingId}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Order</label>
            <input
              type="text"
              value={cutting.Order_Id__c}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Product</label>
            <input
              type="text"
              value={cutting.Product__c ?? "-"}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Received Weight</label>
            <input
              type="number"
              value={receivedWeight}
              onChange={(e) => setReceivedWeight(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Issued Date</label>
            <input
              type="text"
              value={
                cutting.Issued_Date__c
                  ? new Date(cutting.Issued_Date__c).toLocaleDateString()
                  : "-"
              }
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Received Date</label>
            <input
              type="text"
              value={
                cutting.Received_Date__c
                  ? new Date(cutting.Received_Date__c).toLocaleDateString()
                  : "-"
              }
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-start">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

