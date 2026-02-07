# Memory Match Grid - Cloudinary Setup Guide

## Overview
The Memory Match Grid game now uses Cloudinary images instead of emojis. Follow this guide to set up your images.

## Game Configuration
- **Total Cards**: 20 cards (10 pairs)
- **Card Ratio**: 3:4 (portrait orientation)
- **Recommended Image Size**: 300x400 pixels or higher
- **Timer**: 3 minutes to complete all matches

## Setting Up Cloudinary Images

### Step 1: Upload Images to Cloudinary
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to Media Library
3. Upload 10 unique images for your memory game
4. Recommended image categories:
   - Animals
   - Objects
   - Shapes
   - Educational icons
   - Fruits/Vegetables

### Step 2: Get Image URLs
After uploading, copy the secure URLs for each image. They will look like:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123456789/image1.jpg
```

### Step 3: Update the Component
Open `memoryMatchGrid.tsx` and replace the `CLOUDINARY_IMAGES` array (around line 25) with your actual image URLs:

```typescript
const CLOUDINARY_IMAGES = [
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image1.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image2.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image3.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image4.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image5.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image6.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image7.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image8.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image9.jpg",
  "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v123/image10.jpg",
];
```

## Image Requirements

### Recommended Format
- **Format**: JPG or PNG
- **Size**: 300x400px (or any 3:4 ratio)
- **File Size**: Under 200KB for faster loading
- **Quality**: Clear and visually distinct from other images

### Image Selection Tips
1. Choose images that are easily distinguishable
2. Avoid similar-looking images
3. Use high contrast images for better visibility
4. Consider the age group of your students
5. Use culturally appropriate content

## Alternative: Using the Upload Function

If you want to upload images dynamically through your admin panel, you can use the existing `uploadToCloudinary` function. You'll need to:

1. Create an admin interface to upload images
2. Store the uploaded image URLs in your database
3. Fetch these URLs when starting the game
4. Replace the hardcoded array with the fetched URLs

Example:
```typescript
// In your component
const [gameImages, setGameImages] = useState<string[]>([]);

useEffect(() => {
  const fetchImages = async () => {
    const response = await axios.get(`${API_URL}/puzzles/images`);
    setGameImages(response.data.images);
  };
  fetchImages();
}, []);

// Use gameImages instead of CLOUDINARY_IMAGES
const images = gameImages.slice(0, pairCount);
```

## Fallback Images
The component includes a fallback mechanism. If an image fails to load, it will show a placeholder with the card number.

## Testing
1. Start the game in Individual or Group mode
2. Verify all images load correctly
3. Check that the 3:4 aspect ratio looks good
4. Ensure matched pairs are visually identical

## Troubleshooting

### Images Not Loading
- Check if Cloudinary URLs are correct
- Verify your Cloudinary account is active
- Check browser console for CORS errors
- Ensure URLs use `https://` protocol

### Images Look Stretched
- Verify images are in 3:4 ratio (e.g., 300x400px)
- Use `object-cover` CSS class (already applied)

### Performance Issues
- Compress images before uploading
- Use Cloudinary's automatic optimization
- Consider lazy loading for better performance

## Game Features

### Current Features
✅ 20 cards (10 pairs) configuration
✅ 3:4 card aspect ratio
✅ Animated timer with color coding
✅ Preview phase (15 seconds)
✅ Solve phase (3 minutes)
✅ Real-time match tracking
✅ Beautiful result display with score breakdown
✅ Responsive design

### Timer Colors
- 🔵 Blue: Preview/Memorize phase
- 🟢 Green: More than 60 seconds left
- 🟠 Orange: 30-60 seconds left
- 🔴 Red: Less than 30 seconds (with pulse animation)

## Contact
For issues or questions, refer to the main project documentation or contact the development team.
