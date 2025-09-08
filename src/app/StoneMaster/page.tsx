"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const apiBaseUrl = "http://localhost:5001";

  const apiBaseUrl = "https://erp-server-r9wh.onrender.com";

const StoneMaster = () => {
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [shape, setShape] = useState("");
  const [size, setSize] = useState("");
  const [piece, setPiece] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventory, setInventory] = useState([]);
  const router = useRouter();

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/stonesummary`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.summary);
      }
    } catch (err) {
      console.error("Failed to load inventory summary", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !color || !shape || !size || !piece || !weight) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    const formData = { type, color, shape, size, piece, weight };

    try {
      const response = await fetch(`${apiBaseUrl}/create/stone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Stone details submitted successfully");
        alert("Stone details submitted successfully");

        setType("");
        setColor("");
        setShape("");
        setSize("");
        setPiece("");
        setWeight("");

        router.refresh();
        fetchInventory();
      } else {
        throw new Error(result.message || "Failed to create record");
      }
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-2 gap-8">
      {/* Left Side: Stone Master Form */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Stone Details</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Type</label>
              
              <Input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="Enter type" required />
              {/* <Select onValueChange={setType} value={type}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Diamond">Diamond</SelectItem>
                  <SelectItem value="Ruby">Ruby</SelectItem>
                  <SelectItem value="Pearl">Pearl</SelectItem>
                  <SelectItem value="Garnet">Garnet</SelectItem>
                  <SelectItem value="Aquamarine">Aquamarine</SelectItem>
                  <SelectItem value="Moonstone">Moonstone</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div>
              <label className="block mb-2 font-medium">Color</label>
              <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Enter color" required />
            </div>

            <div>
              <label className="block mb-2 font-medium">Shape</label>
              <Input type="text" value={shape} onChange={(e) => setShape(e.target.value)} placeholder="Enter shape" required />
            </div>

            <div>
              <label className="block mb-2 font-medium">Size</label>
              <Input type="text" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Enter size" required />
            </div>

            <div>
              <label className="block mb-2 font-medium">Piece</label>
              <Input type="number" min="1" value={piece} onChange={(e) => setPiece(Number(e.target.value))} placeholder="Enter piece" required />
            </div>

            <div>
              <label className="block mb-2 font-medium">Weight (grams)</label>
              <Input type="number" step="0.0001" min="0" value={weight} onChange={(e) => setWeight(Number(e.target.value))} placeholder="Enter weight" required />
            </div>

            <div className="text-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting....." : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Side: Stone Inventory Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className=" mb-4 text-center text-2xl font-bold">Stone Inventory Summary</h2>
        <table className="w-full table-auto border-collapse border border-gray-600" >
          <thead >
            <tr className="text-white" style={{background:"#1A7A75"}}>
              <th className="border p-2">Type</th>
              <th className="border p-2">Total Pieces</th>
              <th className="border p-2">Total Weight (grams)</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item: any, index: number) => (
              <tr key={index} style={{textAlign:"center"}}>
                <td className="border p-2">{item.type}</td>
                <td className="border p-2">{item.totalPieces}</td>
                <td className="border p-2">{item.totalWeight}</td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td className="border p-2 text-center" colSpan={3}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoneMaster;
