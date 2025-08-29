"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id?: string;
  name: string;
  partyCode: string;
  gstNo: string;
  panNo: string;
  address: string;
  pincode: string;
  mobile: string;
  email: string;
  accountType: string;
}



export default function VendorCreation() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [frompage, setFrompage] = useState(false);
   const [listpage, setlistpage] = useState(true);
const [formData, setFormData] = useState<Vendor>({
  name: "",
  partyCode: "",
  gstNo: "",
  panNo: "",
  address: "",
  pincode: "",
  mobile: "",
  email: "",
  accountType: "",
});


  const [loading, setLoading] = useState(false);

  // Fetch vendors (GET API)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/party-ledger");
        const data = await res.json();
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };
    fetchVendors();
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit (POST API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/party-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add vendor");

      const newVendor = await res.json();
      setVendors([...vendors, newVendor]);
    setFormData({
  name: "",
  partyCode: "",
  gstNo: "",
  panNo: "",
  address: "",
  pincode: "",
  mobile: "",
  email: "",
  accountType: "",
});
      alert("Vendor added successfully!");
    } catch (err) {
        
      console.error("Error submitting vendor:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="w-full mt-20" style={{ height: "100vh" }}>
      <div className="max-w-screen-md mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
         Vendor Details
        </h1>

     <div className="overflow-x-auto">
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-4">Party Ledger / Vendor Ledger</h1> */}

      {/* Form Section */}

<div>
  {frompage ? (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Party Code</label>
          <input
            type="text"
            name="partyCode"
            value={formData.partyCode}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>
         <div>
          <label className="block font-medium">GST No</label>
          <input
            type="text"
            name="gstNo"
            value={formData.gstNo}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
   <div>
  <label className="block font-medium">PAN No</label>
  <input
    type="text"
    name="panNo"
    value={formData.panNo}
    onChange={handleChange}
    className="border rounded p-2 w-full"
  />
</div>
        <div>
          <label className="block font-medium">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
     <div>
  <label className="block font-medium">Pincode</label>
  <input
    type="text"
    name="pincode"
    value={formData.pincode}
    onChange={handleChange}
    className="border rounded p-2 w-full"
  />
</div>

<div>
  <label className="block font-medium">Mobile No</label>
  <input
    type="text"
    name="mobile"
    value={formData.mobile}
    onChange={handleChange}
    className="border rounded p-2 w-full"
  />
</div>

<div>
  <label className="block font-medium">Email ID</label>
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className="border rounded p-2 w-full"
  />
</div>

<div>
  <label className="block font-medium">Account Type</label>
  <input
    type="text"
    name="accountType"
    value={formData.accountType}
    onChange={handleChange}
    className="border rounded p-2 w-full"
  />
</div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Add Vendor"}
        </button>
      </form>
      <div className="text-center flex  align-right justify-end">
      <button
        onClick={() => { setFrompage(false); setlistpage(true); }}
        className="mb-1 mt-3 text-blue-600 fon btn btn-success btn-block w-50 text-center align-middle"
      >
        Go to Vendor List
      </button>
        </div>
    </>
  ) : (
    <div className="text-center flex  align-right justify-end">
    <button
      onClick={() => { setFrompage(true); setlistpage(false); }}
      className="mb-4 text-blue-600 fon btn btn-success btn-block w-50 text-center align-middle"
    >
      Add New Vendor
    </button>
    </div>
  )}
</div>
 {listpage ? (
    <div>
      {/* Vendor List */}
      <h2 className="text-xl font-semibold mt-6">Vendors</h2>
      <table className="w-full border mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Party Code</th>
            <th className="border p-2">PAN No</th>
            <th className="border p-2">GST No</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Pincode</th>
            <th className="border p-2">Mobile no</th>
            <th className="border p-2">Email ID</th>
            <th className="border p-2">Account Type</th>
          </tr>
        </thead>
       <tbody>
  {vendors.length > 0 ? (
    vendors.map((v, idx) => (
      <tr key={idx}>
        <td className="border p-2">{v.name}</td>
        <td className="border p-2">{v.partyCode}</td>
        <td className="border p-2">{v.panNo}</td>
        <td className="border p-2">{v.gstNo}</td>
        <td className="border p-2">{v.address}</td>
        <td className="border p-2">{v.pincode}</td>
        <td className="border p-2">{v.mobile}</td>
        <td className="border p-2">{v.email}</td>
        <td className="border p-2">{v.accountType}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={9} className="text-center p-2">No Vendors Found</td>
    </tr>
  )}
</tbody>

      </table>
      </div>
) : null}
    </div>
    </div>
    </div>
    </div>
  );
}
