const fetch = require("node-fetch");
const FormData = require("form-data");

/**
 * Upload audio buffer to Cloudinary
 * @param {Buffer} fileBuffer - The audio file buffer
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = async (fileBuffer) => {
  const formData = new FormData();
  formData.append("file", fileBuffer, "audio.mp3");
  formData.append("upload_preset", "ml_default"); // Change this to your Cloudinary upload preset
  formData.append("resource_type", "video"); // For audio files

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dmebh0vcd/video/upload", // Change to your cloud name
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.secure_url;
};

module.exports = uploadToCloudinary;
