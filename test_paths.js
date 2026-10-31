const fs = require('fs');
const path = require('path');

function checkHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const regex = /(?:href|src)=["']([^"'#?]+)(?:[#?][^"']*)?["']/g;
  let match;
  const issues = [];
  while ((match = regex.exec(content)) !== null) {
    const ref = match[1];
    if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('data:')) {
      continue;
    }
    const targetPath = path.resolve(dir, ref);
    if (!fs.existsSync(targetPath)) {
      issues.push({ ref, targetPath });
    }
  }
  return issues;
}

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (item.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = walk('frontend');
let totalIssues = 0;
for (const file of htmlFiles) {
  const issues = checkHtmlFile(file);
  if (issues.length > 0) {
    console.log('Issues in ' + file + ':');
    issues.forEach(i => console.log('  Missing: ' + i.ref + ' -> resolved: ' + i.targetPath));
    totalIssues += issues.length;
  }
}
if (totalIssues === 0) {
  console.log('All ' + htmlFiles.length + ' HTML files have valid relative href and src paths!');
}
