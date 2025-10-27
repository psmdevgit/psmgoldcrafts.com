"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Portal } from "@radix-ui/react-portal"; // ✅

//const apiUrl = "http://localhost:5001";


const apiUrl = "https://kalash.app";
// Interfaces
interface InventoryItem {
  id: string;
  itemName: string;
  issueWeight: number;
  purity: string;
  availableWeight: number;
}

interface Order {
  id: string;
  orderNumber: string;
  partyName: string;
}


interface InventoryApiItem {
  name: string;
  availableWeight: number;
  purity: string;
}



interface Stone {
  Id: string;
  Name: string;
  Type__c: string;
  Colour__c: string;
  Shape__c: string;
  Size__c: number;
  Pieces__c: number;
  Weight__c: number;
}


const TreeForm = () => {
  const router = useRouter();
  const [treecastingID, setTreecastingID] = useState<string>("");
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [selectedType, setSelectedType] = useState("");
const [selectedColor, setSelectedColor] = useState("");
const [selectedShape, setSelectedShape] = useState("");
const [selectedSize, setSelectedSize] = useState("");
const [filteredStones, setFilteredStones] = useState<Stone[]>([]);

  const [inventoryApiItems, setInventoryApiItems] = useState<InventoryApiItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [stones, setStones] = useState<Stone[]>([]);
  const [selectedStone, setSelectedStone] = useState<Stone | null>(null);
  const [stoneWeight, setStoneWeight] = useState<number>(0);

  const [waxTreeWeight, setWaxTreeWeight] = useState<number>(0);
  const [purity, setPurity] = useState<string>("");

  const [castingLastNumber, setCastingLastNumber] = useState<string>("");

  const [issuedDate, setIssuedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });

  const [issuedTime, setIssuedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  });


  useEffect(() => {
  let temp = stones;

  if (selectedType) temp = temp.filter(s => s.Type__c === selectedType);
  if (selectedColor) temp = temp.filter(s => s.Colour__c === selectedColor);
  if (selectedShape) temp = temp.filter(s => s.Shape__c === selectedShape);
  if (selectedSize) temp = temp.filter(s => s.Size__c === selectedSize);

  setFilteredStones(temp);
}, [selectedType, selectedColor, selectedShape, selectedSize, stones]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/orders`);
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
        order.partyName.toLowerCase().includes(searchOrder.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchOrder, orders]);

  // Fetch inventory
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch(`${apiUrl}/get-inventory`);
        const data = await response.json();
        if (data.success) {
          setInventoryApiItems(data.data);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
    fetchInventoryItems();
  }, []);

  // Fetch stones
  useEffect(() => {
    const fetchStones = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/stones`);
        const data = await res.json();
        if (data.success) {
          setStones(data.data);
        }
      } catch (err) {
        console.error("Error fetching stones:", err);
      }
    };
    fetchStones();
  }, []);


useEffect(() => {
  if (castingLastNumber) {
    setTreecastingID(generateCastingNumber());
  }
}, [castingLastNumber]); // 👈 re-run whenever castingLastNumber changes

const generateCastingNumber = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  // Convert to number safely
  const num = parseInt(castingLastNumber || "0", 10);

  // Format like 01, 02, 03...
  const formattedNumber = String(num).padStart(2, "0");

  return `${day}/${month}/${year}/${formattedNumber}`;
};

const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();

  // ✅ Validate required parent fields
  if (!treecastingID && !waxTreeWeight) {
    alert("Casting Number and Wax Tree Weight are mandatory");
    return;
  }

  if (!waxTreeWeight || parseFloat(waxTreeWeight) <= 0) {
    alert("Please enter a valid Wax Tree Weight");
    return;
  }

  if (!selectedOrders || selectedOrders.length === 0) {
    alert("Please select at least one Order");
    return;
  }

  if (stoneRows.length === 0) {
    alert("Please add at least one stone");
    return;
  }

  // ✅ Validate each stone row
  for (let i = 0; i < stoneRows.length; i++) {
    const row = stoneRows[i];
    if (!row.type || !row.color || !row.shape || !row.size || !row.weight) {
      alert(`Row ${i + 1}: All fields (Type, Color, Shape, Size, Weight) are mandatory`);
      return;
    }

    if (parseFloat(row.weight) <= 0) {
      alert(`Row ${i + 1}: Weight must be greater than 0`);
      return;
    }
  }

  // ✅ Calculate total stone weight
  const totalStoneWeight = stoneRows.reduce(
    (sum, row) => sum + (parseFloat(row.weight) || 0),
    0
  );

  // ✅ Prepare tree data
  const treeData = {
    Name: treecastingID || generateCastingNumber(), // safe fallback
    Tree_Weight__c: waxTreeWeight,
    orderId__c: selectedOrders.join(", "),
    stone_weight__c: totalStoneWeight,
    stones: stoneRows.map((row) => ({
      type: row.type,
      color: row.color,
      shape: row.shape,
      size: row.size,
      pcs: row.pieces || 0,
      weight: row.weight,
      name: row.name,
      id: row.id
    }))
  };

  console.log("Submitting tree data:", treeData);

  try {
    const res = await fetch(`${apiUrl}/tree-casting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(treeData)
    });

    const result = await res.json();
    if (result.success) {
      alert("✅ Tree Casting created successfully");
      router.push("/Departments/Waxing/waxing_table");
    } else {
      alert(result.message || "❌ Failed to save tree");
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("⚠️ Error saving tree");
  }
};


 const [stoneRows, setStoneRows] = useState<any[]>([]); // multiple stone rows


  // Function to add a blank stone row
  const addStoneRow = () => {
    setStoneRows([...stoneRows, { type: "", color: "", shape: "", size: "", weight: 0 }]);
  };

  // Update row data
  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...stoneRows];
    updated[index][field] = value;

    // Auto-update weight if size is chosen
    if (field === "size") {
      const stone = stones.find(
        s =>
          s.Size__c === value &&
          (!updated[index].type || s.Type__c === updated[index].type) &&
          (!updated[index].color || s.Colour__c === updated[index].color) &&
          (!updated[index].shape || s.Shape__c === updated[index].shape)
      );
      if (stone) {
        updated[index].weight = stone.Weight__c || 0;
      }
    }

    setStoneRows(updated);
    // Sum all weights
    const total = updated.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
    setStoneWeight(total);
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto p-4 pt-40 mt-[-30px] bg-gray-50">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Update Tree</h2>

          {/* Date, Time, Casting Number */}
          <div className="flex gap-4 mb-4">
            <div>
              <Label>Issue Date</Label>
              <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
            </div>
            <div>
              <Label>Issue Time</Label>
              <Input type="time" value={issuedTime} onChange={(e) => setIssuedTime(e.target.value)} />
            </div>
          <div>
  <Label>Casting Number</Label>
  <Input
    type="number"
    value={castingLastNumber}
    onChange={(e) => setCastingLastNumber(e.target.value)}
  />
  <div className="text-xs text-gray-600 mt-1">
    Preview: {castingLastNumber ? generateCastingNumber() : "DD/MM/YYYY/##"}
  </div>
</div>


          </div>

          {/* Orders Dropdown */}
          <div className="grid grid-cols-3 gap-4 mb-4">
 <div className="mb-4">
            <Label>Select Orders</Label>
            <Button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} variant="outline">
              {selectedOrders.length ? `${selectedOrders.length} orders selected` : "Select Orders"}
            </Button>
            {isDropdownOpen && (
              <div className="mt-2 border rounded bg-white max-h-60 overflow-y-auto">
                <Input
                  placeholder="Search orders..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="mb-2"
                />
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      setSelectedOrders((prev) =>
                        prev.includes(order.id) ? prev.filter((id) => id !== order.id) : [...prev, order.id]
                      )
                    }
                  >
                    <input type="checkbox" checked={selectedOrders.includes(order.id)} readOnly />{" "}
                    {order.id} - {order.partyName}
                  </div>
                ))}
              </div>
            )}
          </div>



          </div>
         
<div className="space-y-4">
  {stoneRows.map((row, index) => (
    <div key={index} className="grid grid-cols-6 gap-4 bg-gray-50 p-4 rounded">

      {/* Step 1: Type */}
      <div>
        <Label>Stone Type</Label>
        <Select
          value={row.type}
          onValueChange={(val) => {
            updateRow(index, "type", val);
            updateRow(index, "color", ""); // reset next steps
            updateRow(index, "shape", "");
            updateRow(index, "size", "");
            updateRow(index, "id", "");
            updateRow(index, "weight", "");
            updateRow(index, "availableWeight", "");
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
          <Portal>
            <SelectContent className="z-[1000] bg-white">
              {[...new Set(stones.map(s => s.Type__c))].map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Portal>
        </Select>
      </div>

      {/* Step 2: Color (enabled only if type chosen) */}
      <div>
        <Label>Stone Color</Label>
        <Select
          value={row.color}
          onValueChange={(val) => {
            updateRow(index, "color", val);
            updateRow(index, "shape", "");
            updateRow(index, "size", "");
            updateRow(index, "id", "");
            updateRow(index, "weight", "");
            updateRow(index, "availableWeight", "");
          }}
          disabled={!row.type}
        >
          <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
          <Portal>
            <SelectContent className="z-[1000] bg-white">
              {[...new Set(
                stones.filter(s => s.Type__c === row.type).map(s => s.Colour__c)
              )].map(color => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Portal>
        </Select>
      </div>

      {/* Step 3: Shape (enabled only if type + color chosen) */}
      <div>
        <Label>Stone Shape</Label>
        <Select
          value={row.shape}
          onValueChange={(val) => {
            updateRow(index, "shape", val);
            updateRow(index, "size", "");
            updateRow(index, "id", "");
            updateRow(index, "weight", "");
            updateRow(index, "availableWeight", "");
          }}
          disabled={!row.type || !row.color}
        >
          <SelectTrigger><SelectValue placeholder="Select Shape" /></SelectTrigger>
          <Portal>
            <SelectContent className="z-[1000] bg-white">
              {[...new Set(
                stones.filter(s =>
                  s.Type__c === row.type && s.Colour__c === row.color
                ).map(s => s.Shape__c)
              )].map(shape => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Portal>
        </Select>
      </div>

      {/* Step 4: Size (enabled only if type + color + shape chosen) */}
      <div>
        <Label>Stone Size</Label>
        <Select
          value={row.size}
          onValueChange={(val) => {
            const selectedStone = stones.find(s =>
              s.Size__c === val &&
              s.Type__c === row.type &&
              s.Colour__c === row.color &&
              s.Shape__c === row.shape
            );
            if (selectedStone) {
              updateRow(index, "size", selectedStone.Size__c);
              updateRow(index, "id", selectedStone.Id);
              updateRow(index, "name", selectedStone.Name);
              updateRow(index, "weight", selectedStone.Weight__c || 0);
              updateRow(index, "availableWeight", selectedStone.Weight__c || 0);
            }
          }}
          disabled={!row.type || !row.color || !row.shape}
        >
          <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
          <Portal>
            <SelectContent className="z-[1000] bg-white">
              {[...new Set(
                stones.filter(s =>
                  s.Type__c === row.type &&
                  s.Colour__c === row.color &&
                  s.Shape__c === row.shape
                ).map(s => s.Size__c)
              )].map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Portal>
        </Select>
      </div>

      {/* Step 5: Weight (enabled only if size chosen) */}
      <div>
        <Label>
          Weight {row.availableWeight ? `(Available: ${row.availableWeight})` : ""}
        </Label>
        <input
          type="number"
          value={row.weight}
          onChange={(e) => updateRow(index, "weight", e.target.value)}
          className="w-full border rounded px-2 py-1"
          disabled={!row.size}
        />
      </div>
    </div>
  ))}

  {/* Add row button */}
  <Button onClick={addStoneRow} className="mt-2">+ Add Stone</Button>

  {/* Total weight */}
  <div className="p-3 bg-green-50 rounded border mt-3">
    <strong>Total Stone Weight: </strong> {stoneWeight}
  </div>
</div>



          {/* Wax Tree Weight */}
          <div className="mb-4">
            <Label>Wax Tree Weight (g)</Label>
            <Input
              type="number"
              value={waxTreeWeight || ""}
              onChange={(e) => setWaxTreeWeight(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Stone Selection */}
       <div className="grid grid-cols-3 gap-4 mb-4">


{selectedStone && (
  <div className="mt-4 p-3 border rounded bg-gray-50">
  {/* <p><strong>Name:</strong> {selectedStone.Name}</p> */}
    <p><strong>Type:</strong> {selectedStone.Type__c}</p>
    <p><strong>Color:</strong> {selectedStone.Colour__c}</p>
    <p><strong>Shape:</strong> {selectedStone.Shape__c}</p>
    <p><strong>Size:</strong> {selectedStone.Size__c}</p>
    <p><strong>Pieces:</strong> {selectedStone.Pieces__c}</p>
    <p><strong>Weight:</strong> {selectedStone.Weight__c} g</p>
      <div>
    <Label>Stone Weight (g)</Label>
    <Input
      type="number"
      value={stoneWeight || ""}
      onChange={(e) => setStoneWeight(parseFloat(e.target.value) || 0)}
    />
    <p className="text-xs text-gray-500 mt-1">
      Default from Stone Master: {selectedStone?.Weight__c ?? "N/A"}g
    </p>
  </div>
  </div>
)}





</div>

            <div>
              <Label>Total Weight (with stones)</Label>
              <Input
                type="number"
                value={(
                  inventoryItems.reduce((sum, item) => sum + item.issueWeight, 0) + (stoneWeight || 0) + (waxTreeWeight || 0)
                ).toFixed(2)}
                disabled
              />
            </div>
          </div>

          {/* Submit */}
         <Button 
  onClick={handleSubmit} 
  className="mt-4 w-1/2 mx-auto block" 
  variant="default"
>
  Submit Tree Details
</Button>

        </div>
      </div>

  );
};

export default TreeForm;
