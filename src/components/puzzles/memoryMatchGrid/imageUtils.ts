/**
 * Memory Match Grid - Cloudinary Image Manager
 * 
 * This utility helps manage Cloudinary images for the memory game.
 * You can either use hardcoded URLs or fetch them from your backend.
 * 
 * 🚀 QUICK START:
 * 1. Upload 10 images to your Cloudinary account
 * 2. Copy the secure URLs
 * 3. Replace the URLs in the CLOUDINARY_IMAGES array below
 * 4. Your images should be in 3:4 ratio (e.g., 300x400px)
 * 
 * 💡 TIP: During development, placeholder images will be used automatically
 * if Cloudinary images are not configured properly.
 */

// Default placeholder images (using via.placeholder.com)
// These will be used in development until you configure your Cloudinary images
export const DEFAULT_MEMORY_IMAGES = [
  "https://via.placeholder.com/300x400/FF6B6B/ffffff?text=Image+1",
  "https://via.placeholder.com/300x400/4ECDC4/ffffff?text=Image+2",
  "https://via.placeholder.com/300x400/45B7D1/ffffff?text=Image+3",
  "https://via.placeholder.com/300x400/FFA07A/ffffff?text=Image+4",
  "https://via.placeholder.com/300x400/98D8C8/ffffff?text=Image+5",
  "https://via.placeholder.com/300x400/F7DC6F/ffffff?text=Image+6",
  "https://via.placeholder.com/300x400/BB8FCE/ffffff?text=Image+7",
  "https://via.placeholder.com/300x400/85C1E2/ffffff?text=Image+8",
  "https://via.placeholder.com/300x400/F8B739/ffffff?text=Image+9",
  "https://via.placeholder.com/300x400/52BE80/ffffff?text=Image+10",
  "https://via.placeholder.com/300x400/E74C3C/ffffff?text=Image+11",
  "https://via.placeholder.com/300x400/3498DB/ffffff?text=Image+12",
  "https://via.placeholder.com/300x400/9B59B6/ffffff?text=Image+13",
  "https://via.placeholder.com/300x400/1ABC9C/ffffff?text=Image+14",
  "https://via.placeholder.com/300x400/F39C12/ffffff?text=Image+15",
];

// ⚠️ IMPORTANT: Replace these URLs with your actual Cloudinary image URLs
// Your Cloudinary URLs should look like:
// https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456789/folder/image.jpg
// 
// To get your URLs:
// 1. Go to https://cloudinary.com/console
// 2. Upload images to Media Library
// 3. Click on an image and copy the "Secure URL"
// 4. Paste all 15 URLs below (minimum 10 for individual mode, 15 for group mode)
export const CLOUDINARY_IMAGES = [
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image1.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image2.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image3.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image4.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image5.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image6.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image7.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image8.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image9.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image10.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image11.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image12.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image13.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image14.jpg",
  "https://res.cloudinary.com/dmebh0vcd/image/upload/v1/memory_game/image15.jpg",
];

/**
 * Upload image to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Secure URL of uploaded image
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = "memory_game"
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dmebh0vcd/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Fetch images from backend API
 * @param apiUrl - Backend API URL
 * @returns Array of image URLs
 */
export const fetchMemoryImages = async (apiUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(`${apiUrl}/puzzles/images`);
    if (!response.ok) throw new Error("Failed to fetch images");
    const data = await response.json();
    return data.images || DEFAULT_MEMORY_IMAGES;
  } catch (error) {
    console.error("Error fetching memory images:", error);
    return DEFAULT_MEMORY_IMAGES;
  }
};

/**
 * Validate image URL
 * @param url - Image URL to validate
 * @returns Promise<boolean>
 */
export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get images based on environment
 * Uses Cloudinary in production, placeholders in development
 */
export const getMemoryImages = (): string[] => {
  const isDevelopment = import.meta.env.DEV;
  
  // In development, check if Cloudinary images are configured
  const hasCloudinaryImages = CLOUDINARY_IMAGES.some(url => 
    !url.includes('v1/memory_game')
  );

  if (isDevelopment && !hasCloudinaryImages) {
    console.warn("Using placeholder images. Configure Cloudinary URLs for production.");
    return DEFAULT_MEMORY_IMAGES;
  }

  return CLOUDINARY_IMAGES;
};

/**
 * Batch upload multiple images
 * @param files - Array of files to upload
 * @param folder - Cloudinary folder name
 * @returns Array of uploaded image URLs
 */
export const batchUploadToCloudinary = async (
  files: File[],
  folder: string = "memory_game"
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width: number = 300,
  height: number = 400
): string => {
  const cloudName = "dmebh0vcd";
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
};
