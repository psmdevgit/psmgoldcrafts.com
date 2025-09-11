// pages/reports/casting.tsx
import { useEffect, useState } from "react";
import { Table, Input, DatePicker, Select, Button, Tag } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function CastingReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
const apiUrl = "http://localhost:5001";
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}/casting-trees/all`)
    const result = await res.json();
    console.log("API response:", result);
    setData(result.data || []); // ✅ always array
    setLoading(false);
  };
  fetchData();
}, []);

  // Apply filters
const filteredData = (Array.isArray(data) ? data : []).filter((item) => {
  const matchesSearch =
    item.Name?.toLowerCase().includes(search.toLowerCase()) ||
    item.orderId__c?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = status === "All" || item.status__c === status;
  return matchesSearch && matchesStatus;
});


  const columns = [
    { title: "ID", dataIndex: "Name", key: "id" },
    { title: "Tree Weight", dataIndex: "Tree_Weight__c", key: "tw" },
    { title: "Order ID", dataIndex: "orderId__c", key: "order" },
    { title: "Stone Name", dataIndex: "stone_type__c", key: "stone" },
    { title: "Stone Weight", dataIndex: "stone_weight__c", key: "sw" },
    {
      title: "Issued Date",
      dataIndex: "issued_Date__c",
      key: "date",
      render: (val: string) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status__c",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "Finished" ? "green" : "orange"}>{text}</Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Casting Tree Report</h2>

      <div className="flex gap-2 mb-4">
        <RangePicker format="DD-MM-YYYY" />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { label: "All Status", value: "All" },
            { label: "Finished", value: "Finished" },
            { label: "Pending", value: "Pending" },
          ]}
        />
        <Input.Search
          placeholder="Search by ID/Order"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => { setStatus("All"); setSearch(""); }}>
          Reset Filters
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="Id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
