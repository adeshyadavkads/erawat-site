const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexHtmlPath = path.join(rootDir, 'index.html');
const bannerHtmlPath = path.join(rootDir, 'erawat-banner-4.html');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const bannerHtml = fs.readFileSync(bannerHtmlPath, 'utf8');

// Find start and end of hero-slider
const startComment = '<!-- ==================================================================\r\n         2. HERO SLIDER SECTION';
const startCommentLF = '<!-- ==================================================================\n         2. HERO SLIDER SECTION';

let heroStartIndex = indexHtml.indexOf(startComment);
if (heroStartIndex === -1) {
  heroStartIndex = indexHtml.indexOf(startCommentLF);
}
if (heroStartIndex === -1) {
  heroStartIndex = indexHtml.indexOf('<section class="hero-slider"');
}

const endSliderTag = '</section>';
const heroEndIndex = indexHtml.indexOf(endSliderTag, heroStartIndex) + endSliderTag.length;

console.log('Hero start index:', heroStartIndex);
console.log('Hero end index:', heroEndIndex);

const beforeHero = indexHtml.slice(0, heroStartIndex);
const afterHero = indexHtml.slice(heroEndIndex);

// Add three.js script tag in head if not present
let modifiedBefore = beforeHero;
if (!modifiedBefore.includes('three.min.js')) {
  modifiedBefore = modifiedBefore.replace(
    '<link rel="stylesheet" href="css/aos.css">',
    '<link rel="stylesheet" href="css/aos.css">\n  <script src="js/three.min.js"></script>'
  );
}

// Enhance banner styling with header integration
let enhancedBanner = bannerHtml;

const headerStyles = `
/* Seamless Header Integration with 3D Banner */
body:has(.ez) .site-header:not(.is-past-ez) {
  background: linear-gradient(180deg, rgba(7, 7, 10, 0.92) 0%, rgba(7, 7, 10, 0.45) 65%, transparent 100%) !important;
  box-shadow: none !important;
  border-block-end: none !important;
  border-bottom: none !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}
body:has(.ez) .site-header:not(.is-past-ez) .brand__logo {
  filter: brightness(0) invert(1) !important;
}
body:has(.ez) .site-header:not(.is-past-ez) .nav__link {
  color: #ffffff !important;
}
body:has(.ez) .site-header:not(.is-past-ez) .header__search-btn {
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}
body:has(.ez) .site-header:not(.is-past-ez) .nav-toggle {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
}
</style>`;

enhancedBanner = enhancedBanner.replace('</style>', headerStyles);

// Seamless header sync on scroll
const scrollTarget = "addEventListener('scroll',function(){tp=prog()},{passive:true});tp=prog();sp=tp;";
const scrollReplacement = `var hdr=document.querySelector('.site-header');
function syncHdr(){if(!hdr)return;var r=sec.getBoundingClientRect();if(r.bottom<=80){hdr.classList.add('is-past-ez')}else{hdr.classList.remove('is-past-ez')}}
addEventListener('scroll',function(){tp=prog();syncHdr()},{passive:true});
addEventListener('resize',syncHdr,{passive:true});
tp=prog();sp=tp;syncHdr();`;

enhancedBanner = enhancedBanner.replace(scrollTarget, scrollReplacement);

const newIndexHtml = modifiedBefore + enhancedBanner + afterHero;

// Output files
const outPath1 = path.join(rootDir, 'index-banner-4.html');
const outPath2 = path.join(rootDir, 'index-banner4.html');
const outPath3 = path.join(rootDir, 'index-banner-4.php');

fs.writeFileSync(outPath1, newIndexHtml, 'utf8');
fs.writeFileSync(outPath2, newIndexHtml, 'utf8');
fs.writeFileSync(outPath3, newIndexHtml, 'utf8');

console.log('Successfully created:');
console.log(' - ' + outPath1);
console.log(' - ' + outPath2);
console.log(' - ' + outPath3);
