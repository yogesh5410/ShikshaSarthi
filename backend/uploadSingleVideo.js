const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
  cloud_name: 'dmebh0vcd',
  api_key: process.env.CLOUDINARY_API_KEY || '859155452626543',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_secret'
});

const uploadVideoToCloudinary = async (videoPath, folderName = 'nmms_videos') => {
  try {
    console.log('📤 Uploading large video to Cloudinary (chunked upload)...\n');
    console.log('   Cloud: dmebh0vcd');
    console.log('   Folder:', folderName);
    console.log('   File:', videoPath);
    
    const stats = fs.statSync(videoPath);
    console.log('   Size:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('\n⏳ This may take a few minutes...\n');

    // Use Cloudinary SDK for large file upload with chunking
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: 'video',
      folder: folderName,
      chunk_size: 6000000, // 6MB chunks
      timeout: 600000, // 10 minutes timeout
      eager: [
        { quality: 'auto', format: 'mp4' }
      ],
      eager_async: false
    });

    console.log('✅ Video uploaded successfully!\n');
    console.log('📊 Upload Details:');
    console.log('   Public ID:', result.public_id);
    console.log('   Format:', result.format);
    console.log('   Duration:', Math.floor(result.duration), 'seconds');
    console.log('   Size:', (result.bytes / (1024 * 1024)).toFixed(2), 'MB');
    console.log('   Width:', result.width, 'px');
    console.log('   Height:', result.height, 'px');
    console.log('\n🔗 Video URL:');
    console.log('   ', result.secure_url);
    console.log('\n📋 Copy this URL to your videoQuestionsData.json file!\n');

    return result.secure_url;
  } catch (error) {
    console.error('❌ Error uploading video:', error.message);
    
    if (error.message.includes('api_key')) {
      console.log('\n⚠️  Please add your Cloudinary API credentials to .env file:');
      console.log('   CLOUDINARY_API_KEY=your_key');
      console.log('   CLOUDINARY_API_SECRET=your_secret');
      console.log('\n💡 Or use local video: /videos/filename.mp4');
    }
    
    throw error;
  }
};

// Main execution
const videoPath = path.join(__dirname, '../public/vedios/invideo-ai-480 NMMS टॉपर्स की ट्रिक_ All Shapes in 110s! 2026-02-07.mp4');

if (!fs.existsSync(videoPath)) {
  console.error('❌ Video file not found:', videoPath);
  console.error('📂 Looking in:', path.dirname(videoPath));
  console.error('📝 Available videos:');
  const dir = path.dirname(videoPath);
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.mp4')) {
        console.error('   -', file);
      }
    });
  }
  process.exit(1);
}

uploadVideoToCloudinary(videoPath, 'nmms_videos')
  .then((url) => {
    console.log('✅ Done! Use this URL in your JSON file.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  });
