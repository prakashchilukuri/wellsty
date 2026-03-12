const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const oldRegex = /<span\s+class="logo-w">\s*W\s*<\/span>\s*<span>\s*ellsty\s*<\/span>/g;
const newHtml = 'W<span class="logo-e"><span></span></span>LLSTY';

let count = 0;
for (const file of files) {
  const filepath = path.join(dir, file);
  const content = fs.readFileSync(filepath, 'utf-8');
  if (oldRegex.test(content)) {
    const updated = content.replace(oldRegex, newHtml);
    fs.writeFileSync(filepath, updated, 'utf-8');
    count++;
    console.log(`Updated ${file}`);
  }
}
console.log(`Total files updated: ${count}`);
