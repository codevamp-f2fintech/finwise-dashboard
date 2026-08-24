const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/lenders/AppBar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const getWebUrl')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const insertPos = lastImportIndex + content.substring(lastImportIndex).indexOf('\n') + 1;
  const helperCode = `
const MAIN_WEB_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const getWebUrl = (path: string) => path.startsWith("http") ? path : \`\${MAIN_WEB_URL}\${path}\`;
`;
  content = content.slice(0, insertPos) + helperCode + content.slice(insertPos);
}

// Replace literal string hrefs
content = content.replace(/href="(\/[^"]*)"/g, 'href={getWebUrl("$1")}');

// Replace product.href
content = content.replace(/href=\{product\.href\}/g, 'href={getWebUrl(product.href)}');
content = content.replace(/href:\s*product\.href/g, 'href: getWebUrl(product.href)');

// Replace page.href
content = content.replace(/href=\{page\.href\}/g, 'href={getWebUrl(page.href)}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Links updated to point to MAIN_WEB_URL');
