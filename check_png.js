// Use pngjs or simple pixel reading or canvas? Node might not have canvas installed, let's check if pngjs or sharp is installed, or write a tiny raw sampler.
const fs = require('fs');
// Let's check installed node modules in project or global
try {
  const sharp = require('sharp');
  console.log('sharp available');
} catch(e) {
  console.log('sharp not available');
}
