"use client";
import { useEffect, useState } from "react";

interface Category {
  Id: string;
  Name: string;
}

interface Model {
  Id: string;
  Name: string;
  Image_URL__c?: string;
}

export default function ImageShowPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [imageUrl, setImageUrl] = useState("");

    const apiBaseUrl = "https://erp-server-r9wh.onrender.com" ;

  
  // const apiBaseUrl = process.env.API_URL || "http://localhost:5001" ;

    useEffect(() => {
      fetchCategories();
    }, []);

  // Fetch categories on page load
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/category-groups`);
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch models when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setModels([]);
      setSelectedModel("");
      setImageUrl("");
      return;
    }

    fetch(`${apiBaseUrl}/api/previewModels?categoryId=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((err) => console.error(err));
  }, [selectedCategory]);

  // Set image when model changes
  useEffect(() => {
    if (!selectedModel) {
      setImageUrl("");
      return;
    }

    const model = models.find((m) => m.Id === selectedModel);
    if (model && model.Image_URL__c) {
      setImageUrl(model.Image_URL__c);
    } else {
      setImageUrl("");
    }
  }, [selectedModel, models]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Models Preview</h2>

      {/* Category Dropdown */}
      <div>
        <label className="font-bold">Category: </label>
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

      {/* Model Dropdown */}
    <div style={{ marginTop: "10px" }}>
  <label className="font-bold">Model Name: </label>
  <select
    value={selectedModel}
    onChange={(e) => setSelectedModel(e.target.value)}
    disabled={!selectedCategory || models.length === 0}
     className="w-full border p-2 rounded"
  >
    {models.length === 0 ? (
      <option value="">No Models</option>
    ) : (
      <>
        <option value="">-- Select Model --</option>
        {models.map((model) => (
          <option key={model.Id} value={model.Id}>
            {model.Name}
          </option>
        ))}
      </>
    )}
  </select>
</div>


      {/* Image Preview */}
      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={imageUrl}
            alt="Model Preview"
            style={{ width: "350px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}
