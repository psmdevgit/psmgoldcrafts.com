"use client";

import React, { useState, useEffect, useRef } from "react";



import { degrees, PDFDocument, PDFImage, PDFPage, rgb,StandardFonts } from "pdf-lib";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";

import COMPANY_LOGO from "@/assets/PothysLogo.png"
import "./add-order.css"; // Ensure this import is present
// import router from "next/router";

import { useRouter } from "next/navigation";


interface OrderFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}



interface FormData {
  partyLedger: string;
  subname: string;
  product: string;
  purity: string;
  advanceMetal: string;
  advanceMetalPurity: string;
  priority: string;
  deliveryDate: string;
  remark: string;
  createdBy: string;
  category?: string;
  wtRange?: string;
  size?: string;
  quantity?: string;
  itemRemark?: string;
}

interface OrderInfo {
  partyCode: string;
  partyName: string;
  orderNo: string;
  orderDate: string;
  category: string;
  purity: string;
  advanceMetal: string;
  advanceMetalPurity: string;
  priority: string;
  deliveryDate: string;
  remark: string;
  createdBy: string;
  status: string;
  pdfBlob?: Blob;
}

interface OrderItem {
  category: string;
  weightRange: string;
  size: string;
  quantity: string;
  remark: string;
  designImage?: string;
}

interface OrderSelectedItem {
  category: string;
  size: string;
  quantity: number;
  grossWeight: string;
  netWeight: string;
  stoneWeight: string;
  designImage?: string;
  modelName: string;
  itemRemark: string; // ✅ match UI
}


  
// interface OrderSelectedItem {
//   category: string;
//   size: string;
//   quantity : string;
//   grossWeight: string;
//   netWeight: string;  
//   stoneWeight: string;
//   designImage?: string;  
//   modelName: string;
//   remarks : string;
// }


const OrderFormModal = ({ open, setOpen }: OrderFormModalProps) => {

  
      const router = useRouter();

  /* ---------------------- STATE ---------------------- */
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [orderSelectedItems, setOrderSelectedItems] = useState<OrderSelectedItem[]>([]);

  const [partyLedgers, setPartyLedgers] = useState<string[]>([]);
  const [isOrderSaved, setIsOrderSaved] = useState(false);
  const [designImage, setDesignImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
   const [orderForm, setOrderForm] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const [showForm, setShowForm] = useState(true); // controls form-card visibility

  /* ---------------------- FORM DATA ---------------------- */
  const [formData, setFormData] = useState<FormData>({
    partyLedger: "",
    subname: "",
    product: "",
    purity: "",
    advanceMetal: "",
    advanceMetalPurity: "",
    priority: "",
    deliveryDate: "",
    remark: "",
    createdBy: "",
    category: "",
    wtRange: "",
    size: "",
    quantity: "",
    itemRemark: "",
  });

  /* ---------------------- API ---------------------- */
  const apiBaseUrl = "https://erp-server-r9wh.onrender.com" ;

  
  // const apiBaseUrl = "http://localhost:5001" ;


  interface Category {
  Id: string;
  Name: string;
}

interface Model {
  Id: string;
  Name: string;
  Image_URL__c?: string;
  Category__c : string;
  Size__c : string;
  Gross_Weight__c : string;
  Net_Weight__c : string;
  Stone_Weight__c : string;
}

  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  
const [selectedModels, setSelectedModels] = useState([]);

const [orderNumber, setOrderNumber] = useState("");


  const [imageUrl, setImageUrl] = useState("");

const handleModelSelect = (modelId) => {
  setSelectedModels((prev) =>
    prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
  );
};



    useEffect(() => {
      fetchCategories();
    }, []);

      // Fetch categories on page load
  // const fetchCategories = async () => {
  //   try {
  //     const response = await fetch(`${apiBaseUrl}/category-groups`);
  //     const result = await response.json();
  //     if (result.success) {
  //       setCategories(result.data);
  //       console.log("cat"+result.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //   }
  // };

  const fetchCategories = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/category-groups`);
    const result = await response.json();

    if (result.success) {
      // Run all checks in parallel
      const checks = result.data.map(async (cat: Category) => {
        const res = await fetch(
          `${apiBaseUrl}/api/previewModels?categoryId=${cat.Name}` // 👈 use Id, not Name
        );
        const models = await res.json();
        return models.length > 0 ? cat : null;
      });

      // Wait for all to finish
      const categoriesWithModels = (await Promise.all(checks)).filter(Boolean) as Category[];

      setCategories(categoriesWithModels);
      console.log("Categories with data:", categoriesWithModels);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};


    // Fetch models when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setModels([]);
      setImageUrl("");
      return;
    }

    fetch(`${apiBaseUrl}/api/previewModels?categoryId=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((err) => console.error(err));
  }, [selectedCategory]);

   const [activeTab, setActiveTab] = useState<"addItem" | "designBank">("addItem");


  useEffect(() => {
    fetchPartyLedgers();
  }, []);

  const fetchPartyLedgers = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/customer-groups`);
      const result = await response.json();
      if (response.ok && result.success) {
        setPartyLedgers(result.data.map((ledger: any) => ledger.Party_Code__c));
      }
    } catch (error) {
      console.error("Error fetching party ledgers:", error);
    }
  };

  /* ---------------------- HANDLERS ---------------------- */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getNextOrderNumber = async (partyCode: string) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/getLastOrderNumber?partyLedgerValue=${partyCode}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get order number");
      }

      let sequence = "0001";
      if (data.lastOrderNumber) {
        const parts = data.lastOrderNumber.split("/");
        if (parts.length === 2 && /^\d{4}$/.test(parts[1])) {
          sequence = (parseInt(parts[1], 10) + 1).toString().padStart(4, "0");
        }
      }

      return `${partyCode}/${sequence}`;
    } catch (error) {
      console.error("Error generating order number:", error);
      throw error;
    }
  };

  const validateOrderInfo = (info: OrderInfo): boolean => {
    const requiredFields: (keyof OrderInfo)[] = [
      "partyCode",
      "partyName",
      "advanceMetal",
      "advanceMetalPurity",
      "priority",
      "deliveryDate",
      "createdBy",
    ];
    return requiredFields.every((field) => Boolean(info[field]));
  };

  const validateItem = (item: OrderItem): boolean => {
    return Boolean(
      item.category && item.weightRange && item.size && item.quantity
    );
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Save Order Started ===');
    console.log('Form Data:', formData);
    
    try {
      if (!formData.partyLedger) {
        console.log('Error: Missing Party Ledger');
        throw new Error("Please select a valid Party Ledger");
      }

      console.log('Getting next order number for:', formData.partyLedger);
      const orderNo = await getNextOrderNumber(formData.partyLedger);
      console.log('Generated Order Number:', orderNo);

      setOrderNumber(orderNo);

      const newOrderInfo: OrderInfo = {
        partyCode: formData.partyLedger,
        partyName: formData.subname,
        orderNo,
        orderDate: new Date().toISOString().split('T')[0],
        category: formData.product,
        purity: formData.purity,
        advanceMetal: formData.advanceMetal,
        advanceMetalPurity: formData.advanceMetalPurity,
        priority: formData.priority,
        deliveryDate: formData.deliveryDate,
        remark: formData.remark,
        createdBy: formData.createdBy,
        status: "Pending"
      };

      console.log('New Order Info:', newOrderInfo);
      console.log('Validating Order Info...');
      
      if (!validateOrderInfo(newOrderInfo)) {
        console.log('Validation Failed. Required fields:', {
          partyCode: newOrderInfo.partyCode,
          partyName: newOrderInfo.partyName,
          advanceMetal: newOrderInfo.advanceMetal,
          advanceMetalPurity: newOrderInfo.advanceMetalPurity,
          priority: newOrderInfo.priority,
          deliveryDate: newOrderInfo.deliveryDate,
          createdBy: newOrderInfo.createdBy,
        });
        throw new Error("Please fill in all required fields!");
      }

      console.log('Validation Passed');
      setOrderInfo(newOrderInfo);
      setIsOrderSaved(true);
      console.log('=== Save Order Completed Successfully ===');
       setShowForm(false);
    } catch (error: any) {
      console.error('Save Order Error:', {
        message: error.message,
        stack: error.stack
      });
      alert(error.message);
    }
  };

  const handleAddItem = () => {
    if (!isOrderSaved) {
      // toast.error("Please save the order first");
      alert("Please save the order first");
      return;
    }

    const newItem = {
      category: formData.category,
      weightRange: formData.wtRange,
      size: formData.size,
      quantity: formData.quantity,
      remark: formData.itemRemark,
      designImage: imagePreview
    };

    console.log('Adding new item with image:', newItem.designImage);
    setOrderItems([...orderItems, newItem]);
    
    setFormData({
      ...formData,
      category: "",
      wtRange: "",
      size: "",
      quantity: "",
      itemRemark: ""
    });
    setDesignImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSelectedItem = () => {
      if (!isOrderSaved) {
      // toast.error("Please save the order first");
      alert("Please save the order first");
      return;
    }
  if (selectedModels.length === 0) {
    alert("Please select at least one model");
    return;
  }

const newItems = selectedModels.map((modelId) => {
  const model = models.find((m) => m.Id === modelId);

  console.log("select Models : " , model);

  // return {
  //   category: model?.Category__c || "",
  //   size: model?.Size__c || "0",
  //   grossWeight: model?.Gross_Weight__c || "0",
  //   netWeight: model?.Net_Weight__c || "0",
  //   stoneWeight: model?.Stone_Weight__c || "0",
  //   designImage: model?.Image_URL__c || "",
  //   modelName: model?.Name || "",
  //   quantity: 1, // 👈 default quantity
  //   itemRemark: "" // 👈 default remarks
  // };
    return {
    category: model?.Category__c || "",
    size: model?.Size__c || "0",
    grossWeight: model?.Gross_Weight__c || "0",
    netWeight: model?.Net_Weight__c || "0",
    stoneWeight: model?.Stone_Weight__c || "0",
    designImage: model?.Image_URL__c || "",
    modelName: model?.Name || "",
    quantity: 1,
    itemRemark: ""
  };
});


  setOrderSelectedItems([...orderSelectedItems, ...newItems]);

  console.log(orderSelectedItems);
  // reset form
  setFormData({
    ...formData,
    category: "",
    wtRange: "",
    size: "",
    quantity: "",
    itemRemark: ""
  });
  setSelectedModels([]);
setSelectedCategory("");

};


const handleRemoveSelectedItem = (index: number) => {
    const updated = [...orderSelectedItems];
    updated.splice(index, 1);
    setOrderSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const dataUrl = reader.result as string;
          console.log('Image loaded:', {
            type: file.type,
            size: file.size,
            dataUrl: dataUrl.substring(0, 100) // Log more of the data URL
          });
          setDesignImage(file);
          setImagePreview(dataUrl);
        } catch (error) {
          console.error('Error processing uploaded image:', error);
          toast.error('Failed to process image');
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    if (activeTab === "designBank") {
      setOrderForm(false);
    } else {
      setOrderForm(true);
    }
  }, [activeTab]);



const generateOrderPDF = async (pdfDoc: PDFDocument) => {
  try {
    if (!orderInfo || !orderSelectedItems || orderSelectedItems.length === 0) {
      console.log("No order details available");
      return pdfDoc;
    }

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
    const margin = 40;
    let y = 550;
    const lineHeight = 20;

    // === Company Header ===
    page.drawText("PSM GOLD CRAFTS", {
      x: (page.getWidth() - boldFont.widthOfTextAtSize("PSM GOLD CRAFTS", 16)) / 2,
      y,
      size: 16,
      font: boldFont,
    });
    y -= lineHeight * 2;

    // === Order Details ===
    page.drawText("Order Details", { x: margin, y, size: 14, font: boldFont });
    y -= lineHeight * 1.5;

    const leftColX = margin;
    const rightColX = page.getWidth() / 2;
    const details = [
      ["Order ID:", orderInfo.orderNo],
      ["Customer Name:", orderInfo.partyName],
      ["Created Date:", orderInfo.orderDate],
      ["Delivery Date:", orderInfo.deliveryDate],
      ["Created By:", orderInfo.createdBy],
      ["Advance Metal:", orderInfo.advanceMetal],
      ["Purity:", orderInfo.purity],
      ["Status:", orderInfo.status],
      ["Remarks:", orderInfo.remark || "-"],
    ];

    let detailY = y;
    details.forEach((d, i) => {
      const x = i % 2 === 0 ? leftColX : rightColX;
      if (i % 2 === 0 && i !== 0) detailY -= lineHeight;

      page.drawText(d[0], { x, y: detailY, size: 10, font: boldFont });
      page.drawText(d[1] || "-", { x: x + 100, y: detailY, size: 10, font });
    });
    y = detailY - lineHeight * 2;

    // === Stone Items Summary ===
    page.drawText("Stone Items Summary", { x: margin, y, size: 12, font: boldFont });
    page.drawLine({
      start: { x: margin, y: y - 5 },
      end: { x: margin + 150, y: y - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    const summaryHeaders = ["Category", "Quantity", "Stone Weight", "Net Weight", "Gross Weight"];
    const colWidths = [150, 100, 100, 100, 100];
    let x = margin;

    summaryHeaders.forEach((h, idx) => {
      const colWidth = colWidths[idx];
      page.drawRectangle({
        x,
        y: y - 20,
        width: colWidth,
        height: 20,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
        color: rgb(0.95, 0.95, 0.95),
      });
      const textWidth = boldFont.widthOfTextAtSize(h, 9);
      page.drawText(h, { x: x + (colWidth - textWidth) / 2, y: y - 15, size: 9, font: boldFont });
      x += colWidth;
    });
    y -= 20;

    const summary = calculateCategorySummary(orderSelectedItems);
    Object.entries(summary).forEach(([category, data]) => {
      x = margin;
      const row = [
        category,
        data.quantity.toString(),
        data.stoneWeight ? data.stoneWeight.toString() : "",
        data.netWeight ? data.netWeight.toString() : "",
        data.grossWeight ? data.grossWeight.toString() : "",
      ];
      row.forEach((val, idx) => {
        const colWidth = colWidths[idx];
        page.drawRectangle({
          x,
          y: y - 20,
          width: colWidth,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        page.drawText(val || "", { x: x + 5, y: y - 15, size: 9, font });
        x += colWidth;
      });
      y -= 20;
    });

    // Total row
    x = margin;
    const totalQty = Object.values(summary).reduce((s, d) => s + d.quantity, 0);
    const totalGross = Object.values(summary).reduce((s, d) => s + (d.grossWeight || 0), 0);
    const totalRow = ["Total", totalQty.toString(), "", "", totalGross.toFixed(2)];
    totalRow.forEach((val, idx) => {
      const colWidth = colWidths[idx];
      page.drawRectangle({
        x,
        y: y - 20,
        width: colWidth,
        height: 20,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
        color: idx === 0 ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1, 0),
      });
      page.drawText(val, { x: x + 5, y: y - 15, size: 9, font: boldFont });
      x += colWidth;
    });
    y -= 40;

    // === Text wrapping helper ===
    const wrapText = (text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";
      words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth - 10) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      });
      if (current) lines.push(current);
      return lines;
    };

    // === Main table ===
    const tableHeaders = ["S.No", "Category", "Item", "Purity", "Size", "Color", "Qty", "Stone Wt", "Net Wt", "Gross Wt", "Remarks", "Image"];
    const tableColWidths = [30, 150, 70, 40, 40, 50, 30, 50, 50, 50, 70, 120];

    // Table header
    x = margin;
    tableHeaders.forEach((h, idx) => {
      page.drawRectangle({
        x,
        y: y - 30,
        width: tableColWidths[idx],
        height: 30,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
        color: rgb(0.95, 0.95, 0.95),
      });
      page.drawText(h, { x: x + 5, y: y - 20, size: 8, font: boldFont });
      x += tableColWidths[idx];
    });
    y -= 30;

    // Table rows
    for (let i = 0; i < orderSelectedItems.length; i++) {
      const item = orderSelectedItems[i];
      x = margin;

      const row = [
        (i + 1).toString(),
        item.category || "",
        item.modelName || "",
        orderInfo.purity || "",
        item.size || "",
        item.color || "yellow",
        item.quantity?.toString() || "",
        item.stoneWeight?.toString() || "",
        item.netWeight?.toString() || "",
        item.grossWeight?.toString() || "",
        item.itemRemark || "",
        item.designImage || "",
      ];

      // Wrap text for all cells except image
      const wrapped = row.map((text, idx) => (idx === 11 ? [""] : wrapText(text, font, 8, tableColWidths[idx])));
      // const rowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 10 + 10;

      const textRowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 10 + 10;
const imageRowHeight = 100 + 10; // image + padding
const rowHeight = Math.max(textRowHeight, imageRowHeight);


      // Draw text cells
      row.forEach((text, idx) => {
        if (idx === 11) return; // skip image for now
        const cellWidth = tableColWidths[idx];
        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: cellWidth,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        let textY = y - 15;
        wrapped[idx].forEach((line) => {
          page.drawText(line, { x: x + 5, y: textY, size: 8, font });
          textY -= 10;
        });
        x += cellWidth;
      });

      // Draw image cell
      const imageCellWidth = tableColWidths[11];
      const imgCellX = x;
      page.drawRectangle({
        x: imgCellX,
        y: y - rowHeight,
        width: imageCellWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });

      if (item.designImage) {
        try {
          const proxyUrl = `${apiBaseUrl}/getimage?fileUrl=${encodeURIComponent(item.designImage)}`;
          const imgRes = await fetch(proxyUrl);
          const imgBytes = await imgRes.arrayBuffer();

          let embeddedImage;
          try {
            embeddedImage = await pdfDoc.embedPng(new Uint8Array(imgBytes));
          } catch {
            embeddedImage = await pdfDoc.embedJpg(new Uint8Array(imgBytes));
          }

          if (embeddedImage) {
              const imgWidth = 80;
              const imgHeight = 80;

            // const padding = 5;
            // const maxImgWidth = imageCellWidth - padding * 2;
            // const maxImgHeight = rowHeight - padding * 2;
            // const scale = Math.min(maxImgWidth / embeddedImage.width, maxImgHeight / embeddedImage.height, 1);
            // const imgWidth = embeddedImage.width * scale;
            // const imgHeight = embeddedImage.height * scale;

            const imgX = imgCellX + (imageCellWidth - imgWidth) / 2;
            const imgY = y - rowHeight + (rowHeight - imgHeight) / 2;

            page.drawImage(embeddedImage, {
              x: imgX,
              y: imgY,
              width: imgWidth,
              height: imgHeight,
            });
          }
        } catch (err) {
          console.error("Image load failed:", err);
        }
      }

      y -= rowHeight;

      // if (y < 100) {
      //   y = 550;
      //   pdfDoc.addPage([841.89, 595.28]);
      // }

      if (y - rowHeight < 50) {
  // Add new page
  const newPage = pdfDoc.addPage([841.89, 595.28]);
  page = newPage; // ❗️ You must update your `page` reference
  y = 550;

  // Redraw table headers on new page
  x = margin;
  tableHeaders.forEach((h, idx) => {
    newPage.drawRectangle({
      x,
      y: y - 30,
      width: tableColWidths[idx],
      height: 30,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
      color: rgb(0.95, 0.95, 0.95),
    });
    newPage.drawText(h, { x: x + 5, y: y - 20, size: 8, font: boldFont });
    x += tableColWidths[idx];
  });
  y -= 30;
}


    }

    return pdfDoc;
  } catch (error) {
    console.error("Error in generateOrderPDF:", error);
    return pdfDoc;
  }
};

function calculateCategorySummary(items: OrderSelectedItem[]) {
  const summary: Record<string, { quantity: number; stoneWeight: number; netWeight: number; grossWeight: number }> = {};
  items.forEach((item) => {
    const category = item.category || "Unknown";
    if (!summary[category]) summary[category] = { quantity: 0, stoneWeight: 0, netWeight: 0, grossWeight: 0 };
    summary[category].quantity += Number(item.quantity) || 0;
    summary[category].stoneWeight += Number(item.stoneWeight) || 0;
    summary[category].netWeight += Number(item.netWeight) || 0;
    summary[category].grossWeight += Number(item.grossWeight) || 0;
  });
  return summary;
}




// const generateImagesOnlyPDF = async (pdfDoc) => {
//   try {
//     if (orderSelectedItems.length === 0) {
//       alert('No models available');
//       return pdfDoc;
//     }

//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//     // Process each model
//     let serialNo = 1;
//     for (const model of orderSelectedItems) {
//       if (model.designImage) {
//         try {
//           // Create a new page for each image (A4 Portrait)
//           const page = pdfDoc.addPage([595.28, 841.89]);
//           const { width, height } = page.getSize();
//           const margin = 50;

//           // Draw image title/caption
//           const caption = `${model.category} - ${model.modelName}`;
//           const fontSize = 12;
//           const textWidth = boldFont.widthOfTextAtSize(caption, fontSize);
//           const textX = (width - textWidth) / 2;

//           page.drawText(caption, {
//             x: textX,
//             y: height - margin,
//             size: fontSize,
//             font: boldFont
//           });

//           console.log(model.designImage)

//           const proxyUrl = `${apiBaseUrl}/getimage?fileUrl=${encodeURIComponent(model.designImage)}`;
//           const response = await fetch(proxyUrl);
//           const imageBytes = await response.arrayBuffer();

//           // Fetch and embed image
//           // const response = await fetch(model.designImage);
//           // const imageBytes = await response.arrayBuffer();



//           let embeddedImage;
//           try {
//             embeddedImage = await pdfDoc.embedPng(new Uint8Array(imageBytes));
//           } catch {
//             embeddedImage = await pdfDoc.embedJpg(new Uint8Array(imageBytes));
//           }

//           if (embeddedImage) {
//             // Calculate available space for image
//             const availableWidth = width - (margin * 2);
//             const availableHeight = height - (margin * 3); // Extra margin for caption

//             // Calculate scale to fit while maintaining aspect ratio
//             const scale = Math.min(
//               availableWidth / embeddedImage.width,
//               availableHeight / embeddedImage.height
//             );

//             // Calculate final dimensions
//             const finalWidth = embeddedImage.width * scale;
//             const finalHeight = embeddedImage.height * scale;

//             // Calculate position to center image
//             const xOffset = (width - finalWidth) / 2;
//             const yOffset = ((height - finalHeight) / 2) + margin; // Adjusted for caption

//             // Draw image
//             page.drawImage(embeddedImage, {
//               x: Number(xOffset),
//               y: Number(yOffset),
//               width: Number(finalWidth),
//               height: Number(finalHeight)
//             });

//             // Draw additional details below the image
//             const details = [
//               `Model: ${model.modelName || '-'}`,
//               `Size: ${model.size || '-'}`,
//               `Net Weight: ${model.netWeight || '-'}`,
//               `Stone Weight: ${model.stoneWeight || '-'}`,
//               `Gross Weight: ${model.grossWeight || '-'}`
//             ];

//             // if (model.remarks) {
//             //   const remarksLines = wrapTextInPDF(model.remarks, width - (margin * 2), font, 10);
//             //   details.push('Remarks:');
//             //   details.push(...remarksLines.map(line => `  ${line}`)); // Add indentation
//             // }

//             let detailY = yOffset - margin;
//             details.forEach(detail => {
//               const detailWidth = font.widthOfTextAtSize(detail, 10);
//               page.drawText(detail, {
//                 x: (width - detailWidth) / 2,
//                 y: detailY,
//                 size: 10,
//                 font: font
//               });
//               detailY -= 20;
//             });
//           }
//         } catch (error) {
//           console.error('Error processing image:', error);
//         }
//       }
//     }

//     // Add page numbers
//     const totalPages = pdfDoc.getPageCount();
//     for (let i = 0; i < totalPages; i++) {
//       const page = pdfDoc.getPage(i);
//       const { width, height } = page.getSize();
//       page.drawText(`Page ${i + 1} of ${totalPages}`, {
//         x: width - 100,
//         y: 30,
//         size: 10,
//         font: font
//       });
//     }

//     return pdfDoc;
//   } catch (error) {
//     console.error('Error generating images PDF:', error);
//     return pdfDoc;
//   }
// };


const generateImagesOnlyPDF = async (pdfDoc) => {
  try {
    if (orderSelectedItems.length === 0) {
      alert('No models available');
      return pdfDoc;
    }

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Process each model
    for (const model of orderSelectedItems) {
      if (model.designImage) {
        try {
          // Create a new page for each image (A4 Portrait)
          const page = pdfDoc.addPage([595.28, 841.89]);
          const { width, height } = page.getSize();
          const margin = 50;

          // Draw caption
          const caption = `${model.category} - ${model.modelName}`;
          const fontSize = 12;
          const textWidth = boldFont.widthOfTextAtSize(caption, fontSize);
          page.drawText(caption, {
            x: (width - textWidth) / 2,
            y: height - margin,
            size: fontSize,
            font: boldFont
          });

          // Fetch image via proxy
          const proxyUrl = `${apiBaseUrl}/getimage?fileUrl=${encodeURIComponent(model.designImage)}`;
          const response = await fetch(proxyUrl);
          const imageBytes = await response.arrayBuffer();

          let embeddedImage;
          try {
            embeddedImage = await pdfDoc.embedPng(new Uint8Array(imageBytes));
          } catch {
            embeddedImage = await pdfDoc.embedJpg(new Uint8Array(imageBytes));
          }

          if (embeddedImage) {
            // 🔥 Fixed image size
            const imgWidth = 300;
            const imgHeight = 300;

            // Center image
            const xOffset = (width - imgWidth) / 2;
            const yOffset = (height - imgHeight) / 2 + 40; // shift up a bit

            page.drawImage(embeddedImage, {
              x: xOffset,
              y: yOffset,
              width: imgWidth,
              height: imgHeight
            });

            // Draw details below image
            const details = [
              `Model: ${model.modelName || '-'}`,
              `Size: ${model.size || '-'}`,
              `Net Weight: ${model.netWeight || '-'}`,
              `Stone Weight: ${model.stoneWeight || '-'}`,
              `Gross Weight: ${model.grossWeight || '-'}`
            ];

            let detailY = yOffset - 40; // place details below image
            details.forEach(detail => {
              const detailWidth = font.widthOfTextAtSize(detail, 10);
              page.drawText(detail, {
                x: (width - detailWidth) / 2,
                y: detailY,
                size: 10,
                font
              });
              detailY -= 20;
            });
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    // Add page numbers
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width } = page.getSize();
      page.drawText(`Page ${i + 1} of ${totalPages}`, {
        x: width - 100,
        y: 30,
        size: 10,
        font
      });
    }

    return pdfDoc;
  } catch (error) {
    console.error('Error generating images PDF:', error);
    return pdfDoc;
  }
};



const handleSubmitOrder = async () => {


        // Generate PDFs with proper instances
         const detailedPdfDoc = await PDFDocument.create();
         const imagesPdfDoc = await PDFDocument.create();
    
         await generateOrderPDF(detailedPdfDoc);
         await generateImagesOnlyPDF(imagesPdfDoc);
     // Convert PDFs to base64
     const detailedPdfBytes = await detailedPdfDoc.save();
     const imagesPdfBytes = await imagesPdfDoc.save();

       // Convert to base64 without data URL prefix
     const detailedPdf = Buffer.from(detailedPdfBytes).toString('base64');
     const imagesPdf = Buffer.from(imagesPdfBytes).toString('base64');

    // design bank upload =================================================================================================

  if (activeTab == "designBank") {

    alert('Submit Order Started      wait..... ');
  if (!orderInfo || orderSelectedItems.length === 0) {
    alert("Please save order info and add at least one item.");
    return;
  }

  // Create FormData for file + JSON together
  const formData = new FormData();

  // Build JSON part (without pdf)
  const jsonPayload = {
    orderNo: orderNumber,
    orderInfo: orderInfo, // saved from form
    items: orderSelectedItems.map((item) => ({
      modelName: item.modelName,
      category: item.category,
      quantity: item.quantity,
      size: item.size,
      grossWeight: item.grossWeight,
      netWeight: item.netWeight,
      stoneWeight: item.stoneWeight,
      itemRemark: item.itemRemark,
      designImage: item.designImage
    })),
  };

  // Append JSON as a string
  formData.append("data", JSON.stringify(jsonPayload));
  
formData.append("imagesPdf", imagesPdf);

formData.append("detailedPdf", detailedPdf);

  // Append PDF file (if present)
  if (orderInfo.pdfBlob) {
    console.log("Adding PDF to form data");
    formData.append(
      "pdfFile",
      orderInfo.pdfBlob,
      `Order_${orderInfo.orderNo}.pdf`
    );
  }
  console.log("detailedPdf",detailedPdf);

  console.log(formData);

  try {
    const res = await fetch(`${apiBaseUrl}/api/orderItems`, {
      method: "POST",
      body: formData, // ✅ don't set Content-Type manually, browser will handle it
    });

    if (!res.ok) throw new Error("Failed to submit order");

    const data = await res.json();
    alert(`Order submitted successfully!`);

    // Reset
    setOrderSelectedItems([]);
    setOrderInfo(null);
    router.push(`/Orders`);
  } catch (err) {
    console.error(err);
    alert("Error submitting order. Check server logs.");
  }
}

    else{
      
    alert('Submit Order Started      wait..... ');
    
   console.log('=== Submit Order Started ===');
    try {
      if (!orderInfo || orderItems.length === 0) {
        console.log('Validation Failed:', {
          hasOrderInfo: !!orderInfo,
          itemsCount: orderItems.length
        });
        alert("Please complete the order info and items before submitting.");
        return;
      }

      // Calculate total quantity
      const totalQuantity = orderItems.reduce(
        (sum, item) => sum + parseInt(item.quantity || "0", 10),
        0
      );

      console.log('Preparing form data with:', {
        orderInfo,
        itemsCount: orderItems.length,
        totalQuantity
      });

      const formData = new FormData();
      const orderData = {
        orderInfo,
        items: orderItems,
        totalQuantity  // Add the total quantity to the order data
      };
      
      console.log('Order Data being sent:', orderData);
      formData.append('orderData', JSON.stringify(orderData));

      if (designImage) {
        formData.append('designImage', designImage);
      }

      if (orderInfo.pdfBlob) {
        console.log('Adding PDF to form data');
        formData.append('pdfFile', orderInfo.pdfBlob, `Order_${orderInfo.orderNo}.pdf`);
      }

      console.log('Making API call to:', `${apiBaseUrl}/api/orders`);
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        method: "POST",
        body: formData,
      });

      console.log('Raw response:', response);
      if (!response.ok) {
        throw new Error("Failed to submit order to server.");
      }

      const data = await response.json();
      console.log('Parsed response:', data);

      if (!data.success) {
        throw new Error(data.error || "Order submission failed.");
      }

      console.log('=== Submit Order Completed Successfully ===');
      alert("Order submitted successfully!");
      router.push(`/Orders`);
    } catch (error: any) {
      console.error('Submit Order Error:', {
        message: error.message,
        stack: error.stack,
        type: error.type
      });
      alert(error.message);
    }
    }

    // design bank upload =================================================================================================

  };
const generatePDF = async () => {
  if (!orderInfo || (orderItems.length === 0 && orderSelectedItems.length === 0)) {
    alert("Please complete the order info and items before generating PDF.");
    return;
  }

  try {
    let pdfBlob; // ✅ Declare outside so it's accessible later

    if (activeTab === "designBank") {        
      pdfBlob = await createOrderWithItemPDF(orderInfo, orderSelectedItems);
    } else {
      pdfBlob = await createOrderPDF(orderInfo, orderItems);
    }

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");

    setOrderInfo(prevInfo => 
      prevInfo 
        ? { ...prevInfo, pdfBlob } 
        : null
    );

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

  async function createOrderWithItemPDF(orderInfo: OrderInfo, orderSelectedItems: OrderSelectedItem[]) {
  // Calculate totals (not used anymore, but you can remove if unnecessary)
  let totalQuantity = 0;
  let totalWeight = 0;
  orderSelectedItems.forEach((item) => {
    const quantity = parseInt(item.quantity) || 0;
    totalQuantity += quantity;
  });

  // Initialize PDF document and fonts
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Constants
  const margin = 35;
  const lineHeight = 20;
  const cellPadding = 5;

  // Wrap text helper
function getWrappedTextAndHeight(input: any, maxWidth: number, fontSize: number) {
  const text = (input ?? "").toString(); // 🔹 Always string
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const width = font.widthOfTextAtSize(currentLine + " " + words[i], fontSize);
    if (width < maxWidth - cellPadding * 2) {
      currentLine += " " + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return {
    lines,
    height: Math.max(lineHeight, lines.length * (fontSize + 2) + cellPadding * 2),
  };
}

function drawWrappedText(
  input: any,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  page: PDFPage,
  isHeader = false
) {
  const text = (input ?? "").toString(); // 🔹 Convert to string
  const { lines } = getWrappedTextAndHeight(text, maxWidth, fontSize);
  let currentY = y - cellPadding;
  lines.forEach((line) => {
    page.drawText(line, {
      x: x + cellPadding,
      y: currentY - fontSize,
      size: fontSize,
      font: isHeader ? boldFont : font,
    });
    currentY -= fontSize + 2;
  });
}


  // Draw table cell
  function drawTableCell(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    page: PDFPage,
    isHeader = false
  ) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
      color: isHeader ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
    });

    if (text) {
      drawWrappedText(text, x, y, width, 10, page, isHeader);
    }
  }

  // Watermark
  function drawWatermark(page: PDFPage, logo?: PDFImage) {
    const { width, height } = page.getSize();
    const watermarkText = "PSM GOLD CRAFTS";
    const watermarkFontSize = 60;

    page.drawText(watermarkText, {
      x: width / 2 - 150,
      y: height / 2,
      size: watermarkFontSize,
      font: boldFont,
      opacity: 0.07,
      rotate: degrees(-45),
    });

    if (logo) {
      const watermarkWidth = width * 0.7;
      const watermarkHeight = (watermarkWidth * logo.height) / logo.width;
      page.drawImage(logo, {
        x: (width - watermarkWidth) / 2,
        y: (height - watermarkHeight) / 2,
        width: watermarkWidth,
        height: watermarkHeight,
        opacity: 0.15,
      });
    }
  }

  // Load logo
  const logoImageBytes = await fetch(COMPANY_LOGO.src).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoImageBytes);

  // First page
  let page = pdfDoc.addPage([595.28, 841.89]);
  drawWatermark(page, logoImage);

  let y = 800;
  const logoWidth = 60;
  const logoHeight = (logoWidth * logoImage.height) / logoImage.width;

  // Header
  page.drawImage(logoImage, {
    x: margin,
    y: y - logoHeight + 16,
    width: logoWidth,
    height: logoHeight,
  });
  page.drawText("PSM Gold Crafts Order Invoice", {
    x: margin + logoWidth + 10,
    y,
    size: 16,
    font: boldFont,
  });
  y -= Math.max(logoHeight, 25);

  // Order details
  const detailsColumnWidths = [150, 350];
  const orderDetailsTable = [
    ["Order No:", orderInfo.orderNo || "0000"],
    ["Customer:", orderInfo.partyName || "Unknown"],
    ["Party Ledger:", orderInfo.partyCode || "N/A"],
    ["Product:", orderInfo.category || "N/A"],
    ["Metal Purity:", orderInfo.purity || "N/A"],
    ["Advance Metal:", orderInfo.advanceMetal || "N/A"],
    ["Advance Metal Purity:", orderInfo.advanceMetalPurity || "N/A"],
    ["Priority:", orderInfo.priority || "N/A"],   
    ["Remark:", orderInfo.remark || "N/A"],
    ["Delivery Date:", orderInfo.deliveryDate || "N/A"],
    ["Created By:", orderInfo.createdBy || "N/A"],
    ["Date:", new Date().toLocaleDateString()],
  ];

  orderDetailsTable.forEach(([label, value]) => {
    const height = Math.max(
      getWrappedTextAndHeight(label, detailsColumnWidths[0], 10).height,
      getWrappedTextAndHeight(value, detailsColumnWidths[1], 10).height
    );
    drawTableCell(margin, y, detailsColumnWidths[0], height, label, page, true);
    drawTableCell(margin + detailsColumnWidths[0], y, detailsColumnWidths[1], height, value, page);
    y -= height;
  });

  y -= lineHeight * 2;

  // Items header
  page.drawText("Order Items", { x: margin, y, size: 14, font: boldFont });
  y -= lineHeight * 1.5;

  const headers = ["Design", "Category", "Size", "Grs Wt", "Net Wt", "Stone Wt", "Qty", "Remarks"];
  const columnWidths = [80, 80, 60, 60, 60, 60, 50, 80];

  let currentX = margin;
  headers.forEach((header, index) => {
    drawTableCell(currentX, y, columnWidths[index], lineHeight, header, page, true);
    currentX += columnWidths[index];
  });
  y -= lineHeight;

  // Items
  for (const item of orderSelectedItems) {
    const rowHeight = 100;
    currentX = margin;

    // Design cell (always empty background)
    drawTableCell(currentX, y, columnWidths[0], rowHeight, "", page);

    // Only embed image if exists
     if (item.designImage) {
    try {
      const proxyUrl = `${apiBaseUrl}/getimage?fileUrl=${encodeURIComponent(item.designImage)}`;
      const response = await fetch(proxyUrl);
      const imageBytes = await response.arrayBuffer();

      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedPng(new Uint8Array(imageBytes));
      } catch {
        embeddedImage = await pdfDoc.embedJpg(new Uint8Array(imageBytes));
      }

      if (embeddedImage) {
        const maxWidth = columnWidths[0] - 10;
        const maxHeight = rowHeight - 10;
        const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height);
        const imgWidth = embeddedImage.width * scale;
        const imgHeight = embeddedImage.height * scale;

        const xOffset = margin + (columnWidths[0] - imgWidth) / 2;
        const yOffset = y - rowHeight + (rowHeight - imgHeight) / 2;

        page.drawImage(embeddedImage, {
          x: xOffset,
          y: yOffset,
          width: imgWidth,
          height: imgHeight,
        });
      }
    } catch (err) {
      console.error("Error fetching or embedding image:", err);
    }
  }

    currentX += columnWidths[0];
    const values = [
      item.category || "N/A",
      item.size || "N/A",
      item.grossWeight || "N/A",
      item.netWeight || "N/A",
      item.stoneWeight || "N/A",
      (parseInt(item.quantity) || 0).toString(),
      item.itemRemark || "-",
    ];

    values.forEach((value, index) => {
      drawTableCell(currentX, y, columnWidths[index + 1], rowHeight, value, page);
      currentX += columnWidths[index + 1];
    });

    y -= rowHeight;

    if (y < 100) {
      page = pdfDoc.addPage([595.28, 841.89]);
      drawWatermark(page, logoImage);
      y = 800;
      currentX = margin;
      headers.forEach((header, index) => {
        drawTableCell(currentX, y, columnWidths[index], lineHeight, header, page, true);
        currentX += columnWidths[index];
      });
      y -= lineHeight;
    }
  }

  // No TOTALS row anymore

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}


  
  async function createOrderPDF(orderInfo: OrderInfo, orderItems: OrderItem[]) {
    // Calculate totals
    let totalQuantity = 0;
    let totalWeight = 0;
    orderItems.forEach((item) => {
      const quantity = parseInt(item.quantity) || 0;
      totalQuantity += quantity;
  
      const weightRange = item.weightRange || "0";
      let avgWeight = 0;
      if (weightRange.includes("-")) {
        const [min, max] = weightRange.split("-").map((w) => parseFloat(w) || 0);
        avgWeight = (min + max) / 2;
      } else {
        avgWeight = parseFloat(weightRange) || 0;
      }
      totalWeight += avgWeight * quantity;
    });
  
    // Initialize PDF document and fonts
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    // Constants
    const margin = 35;
    const lineHeight = 20;
    const cellPadding = 5;
  
    // Function to wrap text
    function getWrappedTextAndHeight(text: string, maxWidth: number, fontSize: number) {
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];
  
      for (let i = 1; i < words.length; i++) {
        const width = font.widthOfTextAtSize(currentLine + " " + words[i], fontSize);
        if (width < maxWidth - cellPadding * 2) {
          currentLine += " " + words[i];
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
      return {
        lines,
        height: Math.max(lineHeight, lines.length * (fontSize + 2) + cellPadding * 2),
      };
    }
  
    // Function to draw wrapped text
    function drawWrappedText(
      text: string,
      x: number,
      y: number,
      maxWidth: number, 
      fontSize: number,
      page: PDFPage,
      isHeader = false,
      isTotal = false
    ) {
      const { lines } = getWrappedTextAndHeight(text, maxWidth, fontSize);
      let currentY = y - cellPadding;
      lines.forEach((line) => {
        page.drawText(line, {
          x: x + cellPadding,
          y: currentY - fontSize,
          size: fontSize,
          font: isHeader || isTotal ? boldFont : font,
        });
        currentY -= fontSize + 2;
      });
    }
  
    // Function to draw table cell
    function drawTableCell(
      x: number, 
      y: number,
      width: number,
      height: number, 
      text: string,
      page: PDFPage,
      isHeader = false,
      isTotal = false
    ) {
      page.drawRectangle({
        x,
        y: y - height,
        width,
        height,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
        color: isHeader ? rgb(0.95, 0.95, 0.95) : isTotal ? rgb(0.9, 0.9, 1) : rgb(1, 1, 1),
      });
  
      if (text) {
        drawWrappedText(text, x, y, width, 10, page, isHeader, isTotal);
      }
    }
  
    // Function to draw watermark
    function drawWatermark(page: PDFPage, logo?: PDFImage) {
      const { width, height } = page.getSize();
  
      // Draw text watermark
      const watermarkText = "PSM GOLD CRAFTS";
      const watermarkFontSize = 60;
  
      page.drawText(watermarkText, {
        x: width / 2 - 150,
        y: height / 2,
        size: watermarkFontSize,
        font: boldFont,
        opacity: 0.07,
        rotate: degrees(-45),
      });
  
      // Draw logo watermark
      if (logo) {
        const watermarkWidth = width * 0.7;
        const watermarkHeight = (watermarkWidth * logo.height) / logo.width;
        page.drawImage(logo, {
          x: (width - watermarkWidth) / 2,
          y: (height - watermarkHeight) / 2,
          width: watermarkWidth,
          height: watermarkHeight,
          opacity: 0.05,
        });
      }
    }

  
    // Load and embed logo
    const logoImageBytes = await fetch(COMPANY_LOGO.src).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
  
    // Create first page and add watermark
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    drawWatermark(page, logoImage);
  
    // Initial position and logo dimensions  
    let y = 800;
    const logoWidth = 60;
    const logoHeight = (logoWidth * logoImage.height) / logoImage.width;
  
    // Draw header with logo
    page.drawImage(logoImage, {
      x: margin,
      y: y - logoHeight + 16,
      width: logoWidth,
      height: logoHeight,
    });
  
    page.drawText("PSM Gold Crafts Order Invoice", {
      x: margin + logoWidth + 10,
      y,
      size: 16,
      font: boldFont,
    });
  
    y -= Math.max(logoHeight, 25);
  
    // Order details table
    const detailsColumnWidths = [150, 350];
    const orderDetailsTable = [
      ["Order No:", orderInfo.orderNo || "0000"],
      ["Customer:", orderInfo.partyName || "Unknown"],
      ["Party Ledger:", orderInfo.partyCode || "N/A"],  
      ["Product:", orderInfo.category || "N/A"],
      ["Metal Purity:", orderInfo.purity || "N/A"],
      ["Advance Metal:", orderInfo.advanceMetal || "N/A"],
      ["Advance Metal Purity:", orderInfo.advanceMetalPurity || "N/A"],
      ["Priority:", orderInfo.priority || "N/A"],
      ["Delivery Date:", orderInfo.deliveryDate || "N/A"],
      ["Created By:", orderInfo.createdBy || "N/A"],
      ["Date:", new Date().toLocaleDateString()],
    ];
  
    orderDetailsTable.forEach(([label, value]) => {
      const height = Math.max(
        getWrappedTextAndHeight(label, detailsColumnWidths[0], 10).height,
        getWrappedTextAndHeight(value, detailsColumnWidths[1], 10).height
      );
      drawTableCell(margin, y, detailsColumnWidths[0], height, label, page, true);
      drawTableCell(margin + detailsColumnWidths[0], y, detailsColumnWidths[1], height, value, page);
      y -= height;
    });
  
    y -= lineHeight * 2;
  
    // Order Items section  
    page.drawText("Order Items", {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    });
    y -= lineHeight * 1.5;
  
    // Update headers and column widths
    const headers = ["Design", "Category", "Weight Range", "Size", "Quantity", "Total Weight", "Remarks"];
    const columnWidths = [80, 80, 80, 60, 60, 80, 80]; // Total should be around 520
    const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      
    // Draw table headers
    let currentX = margin;
    headers.forEach((header, index) => {
      drawTableCell(currentX, y, columnWidths[index], lineHeight, header, page, true);
      currentX += columnWidths[index];
    });
    y -= lineHeight;
  
    // Draw items
    for (const item of orderItems) {
      const quantity = parseInt(item.quantity) || 0;
      const weightRange = item.weightRange || "0";
      let itemTotalWeight = 0;
      
      if (weightRange.includes("-")) {
        const [min, max] = weightRange.split("-").map((w) => parseFloat(w) || 0);
        itemTotalWeight = ((min + max) / 2) * quantity;
      } else {
        itemTotalWeight = (parseFloat(weightRange) || 0) * quantity;
      }

      const rowHeight = 60;
      currentX = margin;
      
      // Draw the design cell border
      drawTableCell(currentX, y, columnWidths[0], rowHeight, "", page);
      
      // Handle design image
      if (item.designImage) {
        try {
          // Get image data
          const imageData = item.designImage;
          console.log('Processing image data:', imageData.substring(0, 100));

          // Extract the base64 data and mime type
          const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          
          if (!matches || matches.length !== 3) {
            console.error('Invalid image data format');
            continue;
          }

          const [, mimeType, base64Data] = matches;
          console.log('Image mime type:', mimeType);

          try {
            // Convert base64 to bytes
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            console.log('Converted to bytes:', imageBytes.length);

            // Embed the image based on mime type
            let pdfImage;
            if (mimeType === 'image/png') {
              pdfImage = await pdfDoc.embedPng(imageBytes);
            } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
              pdfImage = await pdfDoc.embedJpg(imageBytes);
            } else {
              console.error('Unsupported image type:', mimeType);
              continue;
            }

            if (pdfImage) {
              // Calculate dimensions
              const maxWidth = columnWidths[0] - 10;
              const maxHeight = rowHeight - 10;
              
              const scale = Math.min(
                maxWidth / pdfImage.width,
                maxHeight / pdfImage.height
              );
              
              const width = pdfImage.width * scale;
              const height = pdfImage.height * scale;

              // Center image in cell
              const xOffset = margin + (columnWidths[0] - width) / 2;
              const yOffset = y - rowHeight + (rowHeight - height) / 2;

              // Draw image
              page.drawImage(pdfImage, {
                x: xOffset,
                y: yOffset,
                width,
                height,
              });

              console.log('Image embedded successfully', {
                dimensions: { width, height },
                position: { x: xOffset, y: yOffset }
              });
            }
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }

      // Draw other cells
      currentX += columnWidths[0];
      
      const values = [
        item.category || "N/A",
        item.weightRange || "N/A",
        item.size || "N/A",
        quantity.toString(),
        itemTotalWeight.toFixed(2),
        item.remark || "N/A"
      ];

      values.forEach((value, index) => {
        drawTableCell(currentX, y, columnWidths[index + 1], rowHeight, value, page);
        currentX += columnWidths[index + 1];
      });

      y -= rowHeight;

      // Page break check
      if (y < 100) {
        page = pdfDoc.addPage([595.28, 841.89]);
        drawWatermark(page, logoImage);
        y = 800;
        
        currentX = margin;
        headers.forEach((header, index) => {
          drawTableCell(currentX, y, columnWidths[index], lineHeight, header, page, true);
          currentX += columnWidths[index];
        });
        y -= lineHeight;
      }
    }
  
    // Draw totals row
    currentX = margin;
    const totalRow = ["", "TOTAL", "", "", totalQuantity.toString(), totalWeight.toFixed(2), ""];
      
    totalRow.forEach((value, index) => {
      drawTableCell(currentX, y, columnWidths[index], lineHeight, value, page, false, true);
      currentX += columnWidths[index];
    });
  
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  /* ---------------------- RENDER ---------------------- */
  return (
    <div className="containe main ">
      <h1 className="page-title">Create Order</h1>
      
      {/* Both forms wrapped in a single container */}
      

         {/* ========  design bank button ========= */}
     <div className="flex flex gap-2 justify-center my-3" >
       {isOrderSaved && (
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className= {showForm ? " px-4 py-2 bg-red-500 text-white rounded" : " px-4 py-2 bg-yellow-400 text-black rounded"} 
        >
          {showForm ? "Hide Order Form" : "Show Order Form"}
        </button>
      )}

          <button
            onClick={() => setActiveTab("addItem")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "addItem"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Add Item
          </button>

          <button
            onClick={() => {
      setActiveTab("designBank");
      setModels([]);               // ✅ reset models
      setSelectedCategory(""); 
      setOrderForm(false);
    // ✅ reset category
    }}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "designBank"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Design Bank
          </button>
        </div>


{/*       <div className={`forms-containe grid grid-cols-1 md:grid-cols-[50%_50%] gap-4 w-full ${showForm ? "md:grid-cols-[50%_50%]" : "md:grid-cols-1"}`}> */}

            <div className={`forms-container ${showForm ? "show-form" : "hide-form"}`}>
              
        {/* First Form */}
          {showForm && (
        <div className="form-card " >
          <h2 style={{textAlign:"center"}}>Order Information</h2>
          <div className="two-column-form">
            {/* Party Ledger */}
            <div className="field-group">
              <Label htmlFor="partyLedger">Party Ledger</Label>
              <select
                id="partyLedger"
                className="select"
                value={formData.partyLedger}
                onChange={(e) =>
                  handleInputChange("partyLedger", e.target.value)
                }
              >
                <option value="">Select Ledger</option>
                {partyLedgers.map((ledger) => (
                  <option key={ledger} value={ledger}>
                    {ledger}
                  </option>
                ))}
              </select>
            </div>

            {/* Subname */}
            <div className="field-group">
              <Label htmlFor="subname">Party Sub Name</Label>
              <Input
                id="subname"
                value={formData.subname}
                onChange={(e) => handleInputChange("subname", e.target.value)}
                placeholder="e.g., Surname or short name"
              />
            </div>

            {/* Product */}
            <div className="field-group">
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => handleInputChange("product", e.target.value)}
                placeholder="e.g., Necklace"
              />
            </div>

            {/* Purity */}
                <div className="field-group">
    <Label htmlFor="purity">Purity</Label>
    <select
        id="purity"
        value={formData.purity}
        onChange={(value) => handleInputChange("purity", value.target.value)}
    >
        <option value= "">Select Purity</option>
        <option value= "24K">24K</option>
        <option value= "22K">22K</option>
        <option value= "18K">18K</option>
        <option value= "14K">14K</option>
    </select>
    </div>

            {/* Advance Metal */}
            <div className="field-group">
              <Label htmlFor="advanceMetal">Advance Metal</Label>
              <Input
                id="advanceMetal"
                value={formData.advanceMetal}
                onChange={(e) => handleInputChange("advanceMetal", e.target.value)}
                placeholder="e.g., Gold"
              />
            </div>

            {/* Advance Metal Purity */}
            <div className="field-group">
              <Label htmlFor="advanceMetalPurity">Advance Metal Purity</Label>
              <Input
                id="advanceMetalPurity"
                value={formData.advanceMetalPurity}
                onChange={(e) =>
                  handleInputChange("advanceMetalPurity", e.target.value)
                }
                placeholder="e.g., 18K"
              />
            </div>

            {/* Priority */}
            <div className="field-group">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                placeholder="e.g., High"
              />
            </div>

            {/* Delivery Date */}
            <div className="field-group">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) =>
                  handleInputChange("deliveryDate", e.target.value)
                }
              />
            </div>

            {/* Remark */}
            <div className="field-group">
              <Label htmlFor="remark">Remark</Label>
              <textarea
                id="remark"
                rows={2}
                onChange={(e) => handleInputChange("remark", e.target.value)}
                value={formData.remark}
                placeholder="Additional remarks"
              />
            </div>

            {/* Created By */}
            <div className="field-group">
              <Label htmlFor="createdBy">Created By</Label>
              <Input
                id="createdBy"
                value={formData.createdBy}
                onChange={(e) => handleInputChange("createdBy", e.target.value)}
                placeholder="Your Name"
              />
            </div>
          </div>
          <button className="save-button" onClick={handleSaveOrder}>Save Order</button>
        </div>

  )
}


<div>
  



  {/* Second Form */}

  {activeTab === "addItem" && (

        <div className="form-card" id="AddItemBox">
          {/* <h2 style={{textAlign:"center"}}>Add Item</h2>   */}
          <div className="one-column-form">
            <div className="field-group" >
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  handleInputChange("category", e.target.value)
                }
                placeholder="e.g., Pendant"
                disabled={!isOrderSaved}
              />
            </div>

            <div className="field-group">
              <Label htmlFor="wtRange">Weight Range</Label>
              <Input
                id="wtRange"
                value={formData.wtRange}
                onChange={(e) => handleInputChange("wtRange", e.target.value)}
                placeholder="e.g., 10-15g"
                disabled={!isOrderSaved}
              />
            </div>

            <div className="field-group">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
                placeholder="Size"
                disabled={!isOrderSaved}
              />
            </div>

            <div className="field-group">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Quantity"
                disabled={!isOrderSaved}
              />
            </div>

            <div className="field-group">
              <Label htmlFor="itemRemark">Item Remark</Label>
              <Input
                id="itemRemark"
                value={formData.itemRemark}
                onChange={(e) =>
                  handleInputChange("itemRemark", e.target.value)
                }
                placeholder="Any special instructions"
                disabled={!isOrderSaved}
              />
            </div>

            <div className="field-group">
              <Label htmlFor="designImage">Design Image</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="designImage"
                  />
                  {!imagePreview ? (
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      Upload Design Image
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4 p-3 border rounded-md bg-white">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={imagePreview}
                          alt="Design preview"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDesignImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button 
            className="add-item-button" 
            onClick={handleAddItem}
            disabled={!isOrderSaved}
          >
            Add Item
          </button>
        </div>
  )}

   {/* design bank  */}

      {activeTab === "designBank" && (
         <div className="form-card" id="AddItemBox">
          {/* <h2 style={{textAlign:"center"}}>Design Bank</h2> */}
          <div className="one-column-form">
            <div className="fieldgroup flex gap-2">

              <div style={{width:"100%"}}> 
                  <Label htmlFor="category" className="font-bold">Category</Label>
                  <select
                      value={selectedCategory}
                      onChange={(e) =>  setSelectedCategory(e.target.value)}
                                className="w-full border p-2 rounded"
                                disabled={!isOrderSaved}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.Id} value={cat.Id}>
                          {cat.Name}
                        </option>
                      ))}
                    </select>

              </div>
              
            </div>


            <div className="field-group">
              <Label htmlFor="designImage">Design Image</Label>
    


<div
  className={`modelPreview grid gap-4 mt-4 overflow-scroll 
    ${showForm ? "grid-cols-2" : "grid-cols-7"}`}
  style={{ maxHeight: "550px" }}
>
  {models.length > 0 ? (
    models.map((model) => (
      <div
        key={model.Id}
        onClick={() => handleModelSelect(model.Id)}
        className={`p-2 border rounded-md text-center cursor-pointer transition ${
          selectedModels.includes(model.Id)
            ? "bg-blue-200 border-blue-500"
            : "bg-gray-100"
        }`}
      >
        <img
          src={model.Image_URL__c}
          alt={model.Name}
          className="w-50 h-50 object-contain mx-auto"
        />
        <p className="mt-2 text-sm font-medium">{model.Name}</p>
      </div>
    ))
  ) : (
    <p className="col-span-full text-gray-500">
      No models available for this category
    </p>
  )}
</div>


            </div>
          </div>
          <button 
            className="add-item-button" 
            onClick={handleAddSelectedItem}
            // disabled={!isOrderSaved}
          >
            Add Item
          </button>
        </div>
             )}


</div>
   

      

         




      </div>

      {/* Tables Container */}
      <div className="table-container">
        {/* Order Info Table */}
        {orderInfo && (
          <Card className="card">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <table>
                <thead>
                  <tr>
                    <th rowSpan={2}>Party Code</th>
                    <th rowSpan={2}>Party Name</th>
                    <th rowSpan={2}>Order No</th>
                    <th rowSpan={2}>Order Date</th>
                    <th rowSpan={2}>Product</th>
                    <th rowSpan={2}>Purity</th>
                    <th colSpan={2}>Advance Metal Details</th>
                    <th colSpan={3}>Order Details</th>
                  </tr>
                  <tr>
                    <th>Metal</th>
                    <th>Metal Purity</th>
                    <th>Priority</th>
                    <th>Delivery Date</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{orderInfo.partyCode}</td>
                    <td>{orderInfo.partyName}</td>
                    <td>{orderInfo.orderNo}</td>
                    <td>{orderInfo.orderDate}</td>
                    <td>{orderInfo.category}</td>
                    <td>{orderInfo.purity}</td>
                    <td>{orderInfo.advanceMetal}</td>
                    <td>{orderInfo.advanceMetalPurity}</td>
                    <td>{orderInfo.priority}</td>
                    <td>{orderInfo.deliveryDate}</td>
                    <td>{orderInfo.createdBy}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Order Items Table */}
        {orderItems.length > 0 && (
          <Card className="card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Design</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Weight Range</th>
                      <th className="px-4 py-2">Size</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Remarks</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          {item.designImage && (
                            <div className="relative w-20 h-20">
                              <Image
                                src={item.designImage}
                                alt="Design"
                                fill
                                className="object-contain rounded-md"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">{item.category}</td>
                        <td className="px-4 py-2">{item.weightRange}</td>
                        <td className="px-4 py-2">{item.size}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.remark}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={4}
                        style={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        Total:
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {orderItems.reduce(
                          (sum, item) => sum + parseInt(item.quantity || "0", 10),
                          0
                        )}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}


        {/* for slected design  */}

           {/* Order Items Table */}
        {orderSelectedItems.length > 0 && (
          <Card className="card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Design</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Size</th>
                      <th className="px-4 py-2">Gross Weight</th>
                      <th className="px-4 py-2">Net Weight</th>
                      <th className="px-4 py-2">Stone Weight</th>
                      <th className="px-4 py-2">Remarks</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderSelectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          {item.designImage && (
                            <div className="relative w-20 h-20">
                              <Image
                                src={item.designImage}
                                alt="Design"
                                fill
                                className="object-contain rounded-md"
                              />
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-2">{item.modelName}</td>
                        <td className="px-4 py-2">{item.category}</td>                        
         <td className="px-4 py-2">
  <input
    type="number"
    value={item.quantity}
    min="1"
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].quantity = parseInt(e.target.value, 10) || 0;
      setOrderSelectedItems(updated);
    }}
    className="w-20 border rounded p-1"
  />
</td>

<td className="px-4 py-2">
  <input
    type="number"
    step="0.5"
    value={item.size}
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].size = e.target.value;
      setOrderSelectedItems(updated);
    }}
    className="w-24 border rounded p-1"
  />
</td>

<td className="px-4 py-2">
  <input
    type="number"
    step="0.01"
    value={item.grossWeight}
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].grossWeight = e.target.value;
      setOrderSelectedItems(updated);
    }}
    className="w-28 border rounded p-1"
  />
</td>

<td className="px-4 py-2">
  <input
    type="number"
    step="0.01"
    value={item.netWeight}
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].netWeight = e.target.value;
      setOrderSelectedItems(updated);
    }}
    className="w-28 border rounded p-1"
  />
</td>

<td className="px-4 py-2">
  <input
    type="number"
    step="0.01"
    value={item.stoneWeight}
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].stoneWeight = e.target.value;
      setOrderSelectedItems(updated);
    }}
    className="w-28 border rounded p-1"
  />
</td>

           <td className="px-4 py-2">
  <input
    type="text"
    value={item.itemRemark}
    onChange={(e) => {
      const updated = [...orderSelectedItems];
      updated[index].itemRemark = e.target.value;
      setOrderSelectedItems(updated);
    }}
    className="w-full border rounded p-1"
  />
</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() => handleRemoveSelectedItem(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                 <tr>
  <td colSpan={3} style={{ fontWeight: "bold", textAlign: "right" }}>
    Total:
  </td>
  <td style={{ fontWeight: "bold" }}>
    {orderSelectedItems.reduce(
      (sum, item) => sum + parseInt(item.quantity || "0", 10),
      0
    )}
  </td>
  <td colSpan={6}></td>
</tr>

                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Buttons */}
      <div className="button-grou flex mt-3 gap-3">
        <button
          type="button"
          onClick={handleSubmitOrder}
                className={
            isOrderSaved && (orderItems.length > 0 || orderSelectedItems.length > 0)
              ? "bg-yellow-400 font-bold"
              : "bg-gray-400 font-bold"
          }


          disabled={!isOrderSaved && (orderItems.length === 0 || orderSelectedItems.length === 0 )}
        >
          Submit Order
        </button>
        <button
          type="button"
            className={
              isOrderSaved && (orderItems.length > 0 || orderSelectedItems.length > 0)
                ?  "bg-blue-500 font-bold text-white"
                 : "bg-gray-400 font-bold"
            }
          onClick={generatePDF}
          disabled={!isOrderSaved && (orderItems.length === 0 || orderSelectedItems.length === 0 )}
        >
          Generate PDF
        </button>
      </div>

      
      <style jsx>{`

.main{
  width: 85%;
          margin-left: auto;
          margin-right: 0;
}

  .forms-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
  }

  /* When showForm is true */
  .forms-container.show-form {
    grid-template-columns: 50% 50%;
  }

  /* Medium screen responsiveness */
  @media (min-width: 768px) {
    .forms-container.hide-form {
      grid-template-columns: 1fr;
    }

    .forms-container.show-form {
      grid-template-columns: 50% 50%;
    }
  }
`}</style>
      
    </div>
  );
};

export default OrderFormModal;

