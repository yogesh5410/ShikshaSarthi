# Advanced: Dynamic Image Management

If you want to manage memory game images dynamically through an admin panel instead of hardcoding them, follow this guide.

## Backend API Setup

### 1. Add Image Management Routes

Create or update `backend/routes/puzzles.js`:

```javascript
const express = require("express");
const router = express.Router();

// Store images (in production, use a database)
let memoryGameImages = [];

// Get all memory game images
router.get("/images", async (req, res) => {
  try {
    // In production, fetch from database
    res.status(200).json({ images: memoryGameImages });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Save new images
router.post("/images", async (req, res) => {
  try {
    const { images } = req.body;
    
    if (!Array.isArray(images) || images.length < 10) {
      return res.status(400).json({ 
        error: "Please provide at least 10 image URLs" 
      });
    }

    // In production, save to database
    memoryGameImages = images;

    res.status(200).json({ 
      success: true, 
      message: "Images saved successfully",
      count: images.length 
    });
  } catch (error) {
    console.error("Error saving images:", error);
    res.status(500).json({ error: "Failed to save images" });
  }
});

// Existing evaluate endpoint...
router.post("/evaluate", async (req, res) => {
  // ... existing code
});

module.exports = router;
```

### 2. Database Schema (MongoDB Example)

```javascript
// models/MemoryGameImage.js
const mongoose = require("mongoose");

const memoryGameImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "general",
  },
  active: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MemoryGameImage", memoryGameImageSchema);
```

## Frontend Admin Component

### 1. Create Admin Component

Create `src/pages/admin/MemoryGameImageManager.tsx`:

```tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, X, Check } from "lucide-react";
import { uploadToCloudinary } from "@/components/puzzles/memoryMatchGrid/imageUtils";

const API_URL = import.meta.env.VITE_API_URL;

const MemoryGameImageManager: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/puzzles/images`);
      setImages(response.data.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file, "memory_game"));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);
      
      const newImages = [...images, ...validUrls];
      setImages(newImages);
      
      // Save to backend
      await axios.post(`${API_URL}/puzzles/images`, { images: newImages });
      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!confirm("Remove this image?")) return;
    
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    try {
      await axios.post(`${API_URL}/puzzles/images`, { images: newImages });
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleSave = async () => {
    if (images.length < 10) {
      alert("Please add at least 10 images");
      return;
    }

    try {
      await axios.post(`${API_URL}/puzzles/images`, { images });
      alert("Images saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save images");
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Memory Game Image Manager</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-lg">
              Total Images: <span className="font-bold">{images.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              {images.length < 10 
                ? `Add ${10 - images.length} more images (minimum 10 required)`
                : "✓ Ready to use"}
            </p>
          </div>

          <div className="flex gap-3">
            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Images"}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <button
              onClick={handleSave}
              disabled={images.length < 10}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={url}
                alt={`Memory card ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                #{index + 1}
              </div>
            </div>
          ))}

          {/* Placeholder slots */}
          {Array.from({ length: Math.max(0, 10 - images.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              style={{ aspectRatio: "3/4" }}
            >
              <p className="text-gray-400 text-sm">Empty slot</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📋 Guidelines:</h3>
        <ul className="text-sm space-y-1">
          <li>• Upload at least 10 unique images</li>
          <li>• Images should be in 3:4 aspect ratio (e.g., 300x400px)</li>
          <li>• Choose distinct, easily recognizable images</li>
          <li>• Keep file sizes under 200KB for better performance</li>
          <li>• Use high-quality, clear images</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryGameImageManager;
```

### 2. Update Game Component to Fetch Dynamically

Modify `memoryMatchGrid.tsx`:

```tsx
import { fetchMemoryImages } from "./imageUtils";

const MemoryMatchGrid: React.FC = () => {
  const [gameImages, setGameImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const images = await fetchMemoryImages(API_URL);
      setGameImages(images);
      setLoadingImages(false);
    };
    loadImages();
  }, []);

  const startGame = (selectedMode: "individual" | "group") => {
    // Use gameImages instead of getMemoryImages()
    const images = gameImages.slice(0, pairCount);
    // ... rest of the code
  };

  if (loadingImages) {
    return <div>Loading game...</div>;
  }

  // ... rest of component
};
```

## Database Implementation

### MongoDB Example

```javascript
// backend/routes/puzzles.js
const MemoryGameImage = require("../models/MemoryGameImage");

router.get("/images", async (req, res) => {
  try {
    const images = await MemoryGameImage
      .find({ active: true })
      .sort({ order: 1 })
      .limit(20);
    
    const urls = images.map(img => img.url);
    res.status(200).json({ images: urls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

router.post("/images", async (req, res) => {
  try {
    const { images } = req.body;
    
    // Remove old images
    await MemoryGameImage.deleteMany({});
    
    // Add new images
    const imageDocuments = images.map((url, index) => ({
      url,
      order: index,
      active: true,
    }));
    
    await MemoryGameImage.insertMany(imageDocuments);
    
    res.status(200).json({ 
      success: true, 
      message: "Images saved successfully",
      count: images.length 
    });
  } catch (error) {
    console.error("Error saving images:", error);
    res.status(500).json({ error: "Failed to save images" });
  }
});
```

## Benefits of Dynamic Management

1. ✅ No code changes needed to update images
2. ✅ Changes take effect immediately
3. ✅ Easy to manage multiple image sets
4. ✅ Can add categories or themes
5. ✅ Better content management

## Simple vs Advanced

**Simple (Hardcoded):**
- ✅ Easier to set up
- ✅ No database needed
- ✅ Faster initial load
- ❌ Requires code deployment to update

**Advanced (Dynamic):**
- ✅ No deployments for content updates
- ✅ Better for non-technical admins
- ✅ Can have multiple sets
- ❌ Requires backend + database
- ❌ Additional API calls

Choose based on your needs!
