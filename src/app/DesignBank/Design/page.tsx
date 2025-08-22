"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

const apiBaseUrl = "https://erp-server-r9wh.onrender.com";

interface Category {
  Id: string;
  Name: string;
}

interface Model {
  Id: string;
  Name: string;
  Image_URL__c?: string;
  Category__c: string;
  Size__c: string;
  Gross_Weight__c: string;
  Net_Weight__c: string;
  Stone_Weight__c: string;
}

const Designs: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // Fetch categories on page load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/category-groups`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
        console.log("Categories:", result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch models when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setModels([]);
      return;
    }

    fetch(`${apiBaseUrl}/api/previewModels?categoryId=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        console.log("Models:", data);
      })
      .catch((err) => console.error("Error fetching models:", err));
  }, [selectedCategory]);

  return (
    <div className="form-card" id="AddItemBox" >
      <h2 style={{ textAlign: "center" }}>Design Bank</h2>
      <div className="one-column-form">
        <div className="fieldgroup flex gap-2">
          <div style={{ width: "30%" }}>
            <Label htmlFor="category" className="font-bold">
              Category
            </Label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border p-2 rounded"
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

        <div className="field-group mt-4">
          <Label htmlFor="designImage " className="font-bold">Design Models</Label>
          <div
            className="modelPreview grid gap-4 mt-4 overflow-scroll grid-cols-6"
            style={{ maxHeight: "700px" }}
          >
            {models.length > 0 ? (
              models.map((model) => (
                <div
                  key={model.Id}
                  className=" p-2 border rounded-md text-center cursor-pointer transition"  style={{background:"#FBF0DC",display:"flex", flexDirection:"column",justifyContent:"space-between"}}              >
                  <img
                    src={model.Image_URL__c}
                    alt={model.Name}
                    className="object-contain mx-auto"
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
    </div>
  );
};

export default Designs;
