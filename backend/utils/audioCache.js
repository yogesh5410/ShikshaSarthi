const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Cache directory
const CACHE_DIR = path.join(__dirname, '..', 'data', 'audio-cache');

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log('Audio cache directory created:', CACHE_DIR);
  }
}

// Generate filename from URL
function getFilenameFromUrl(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `${hash}.mp3`;
}

// Get cached file path
function getCachedFilePath(url) {
  const filename = getFilenameFromUrl(url);
  return path.join(CACHE_DIR, filename);
}

// Check if file is cached
function isCached(url) {
  const filePath = getCachedFilePath(url);
  return fs.existsSync(filePath);
}

// Download and cache audio file
function downloadAndCache(url) {
  return new Promise((resolve, reject) => {
    ensureCacheDir();
    
    const filePath = getCachedFilePath(url);
    
    // If already cached, return immediately
    if (fs.existsSync(filePath)) {
      console.log('Audio already cached:', getFilenameFromUrl(url));
      resolve(filePath);
      return;
    }

    console.log('Downloading audio:', url);
    
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Audio cached successfully:', getFilenameFromUrl(url));
        resolve(filePath);
      });

      file.on('error', (err) => {
        fs.unlinkSync(filePath);
        reject(err);
      });
    }).on('error', (err) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

// Batch download multiple audio files
async function batchDownload(urls) {
  const results = {
    success: [],
    failed: []
  };

  for (const url of urls) {
    try {
      const filePath = await downloadAndCache(url);
      results.success.push({
        url,
        cached: true,
        filename: getFilenameFromUrl(url)
      });
    } catch (error) {
      console.error('Failed to cache audio:', url, error.message);
      results.failed.push({
        url,
        error: error.message
      });
    }
  }

  return results;
}

// Get cache statistics
function getCacheStats() {
  ensureCacheDir();
  
  const files = fs.readdirSync(CACHE_DIR);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(CACHE_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });

  return {
    totalFiles: files.length,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    cacheDir: CACHE_DIR
  };
}

// Clear cache
function clearCache() {
  ensureCacheDir();
  
  const files = fs.readdirSync(CACHE_DIR);
  let deleted = 0;
  
  files.forEach(file => {
    const filePath = path.join(CACHE_DIR, file);
    fs.unlinkSync(filePath);
    deleted++;
  });

  return {
    deleted,
    message: `Cleared ${deleted} cached audio files`
  };
}

module.exports = {
  ensureCacheDir,
  getFilenameFromUrl,
  getCachedFilePath,
  isCached,
  downloadAndCache,
  batchDownload,
  getCacheStats,
  clearCache,
  CACHE_DIR
};
