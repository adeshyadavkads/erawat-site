const fs = require('fs');

function setBanner70vh(file) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /\.split-hero__pin\s*\{[\s\S]*?padding:\s*0;\s*z-index:\s*10;\s*\}/,
    `.split-hero__pin {
        position: sticky;
        top: var(--header-actual-h, 110px);
        height: 70vh !important;
        overflow: hidden;
        display: flex;
        align-items: stretch;
        background: #ffffff;
        padding: 0;
        z-index: 10;
      }`
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated banner height to 70vh in ${file}`);
}

setBanner70vh('index.html');
fs.writeFileSync('index.php', fs.readFileSync('index.html', 'utf8'), 'utf8');
console.log('Synchronized index.php');
