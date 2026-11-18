const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

function normalize(str) {
  return str.replace(/\r\n/g, '\n');
}

let norm = normalize(content);

// 1. Clean up stray <div class="header-inner"> in header
norm = norm.replace(
  `      </button>\n<div class="header-inner">\n <nav class="site-nav"`,
  `      </button>\n\n      <nav class="site-nav"`
);

norm = norm.replace(
  `        <!-- <button type="button" class="header__search-btn" id="headerSearchBtn" aria-label="Search site">\n          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n            <circle cx="11" cy="11" r="8"></circle>\n            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>\n          </svg>\n        </button> -->\n      </div>\n</div>\n     \n    </div>\n  </header>`,
  `      </div>\n    </div>\n  </header>`
);

// 2. Add header padding-block constraint and adjust inner & columns
const oldHeroLayoutCss = `    .split-hero__inner {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1.05fr 1.15fr;
      align-items: center;
      padding-top: 72px; /* space below sticky white header */
    }

    /* Part 1: Text Column */
    .split-hero__text-col {
      position: relative;
      height: clamp(420px, 60vh, 540px);
      overflow: hidden;
      padding-left: clamp(24px, 5.5vw, 90px);
      padding-right: clamp(16px, 3vw, 40px);
      display: flex;
      align-items: center;
    }`;

const newHeroLayoutCss = `    .site-header .header__inner {
      padding-block: 8px !important;
    }

    .split-hero__inner {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1.05fr 1.15fr;
      align-items: stretch;
      padding-top: 64px; /* perfectly flush with sticky white header bottom */
      padding-bottom: 24px;
    }

    /* Part 1: Text Column */
    .split-hero__text-col {
      position: relative;
      height: 100%;
      overflow: hidden;
      padding-left: clamp(24px, 5.5vw, 90px);
      padding-right: clamp(16px, 3vw, 40px);
      display: flex;
      align-items: center;
      padding-top: 0;
      padding-bottom: 24px;
    }`;

// 3. Update Part 2 Media Column to remove top padding and align flush to top
const oldMediaColCss = `    /* Part 2: Media Column (Curved Cutout Mask) */
    .split-hero__media-col {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 20px 0 30px;
    }
    .split-hero__card {
      position: relative;
      width: 100%;
      height: clamp(480px, 80vh, 680px);
      overflow: hidden;
      background: #0f172a;
      -webkit-clip-path: url(#heroCutout);
      clip-path: url(#heroCutout);
      border-bottom-left-radius: 120px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
    }`;

const newMediaColCss = `    /* Part 2: Media Column (Curved Cutout Mask - Flush with Header) */
    .split-hero__media-col {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-start; /* top-aligned flush with header bottom */
      justify-content: flex-end;
      padding: 0 0 24px 0; /* no top padding */
    }
    .split-hero__card {
      position: relative;
      width: 100%;
      height: 100%; /* fills directly from below header to bottom */
      min-height: 480px;
      overflow: hidden;
      background: #0f172a;
      -webkit-clip-path: url(#heroCutout);
      clip-path: url(#heroCutout);
      border-bottom-left-radius: 120px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
    }`;

function replaceExact(text, oldPart, newPart, label) {
  const normOld = normalize(oldPart);
  const normNew = normalize(newPart);
  if (!text.includes(normOld)) {
    console.warn('NOT FOUND:', label);
    return text;
  }
  console.log('REPLACED:', label);
  return text.replace(normOld, normNew);
}

norm = replaceExact(norm, oldHeroLayoutCss, newHeroLayoutCss, 'heroLayoutCss');
norm = replaceExact(norm, oldMediaColCss, newMediaColCss, 'mediaColCss');

const finalCRLF = norm.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, finalCRLF, 'utf8');
console.log('Successfully removed unused spacing between header and banner in index.html!');
