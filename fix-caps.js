const fs = require('fs');
let c = fs.readFileSync('components/lenders/AppBar.tsx', 'utf8');

c = c.replace(/fontSize: isIpadPro \? "1vw" : "0\.95vw",/g, 'fontSize: isIpadPro ? "1vw" : "0.95vw",\n                textTransform: "none",');
c = c.replace(/fontSize: isIpadPro \? "1vw" : "1vw",/g, 'fontSize: isIpadPro ? "1vw" : "1vw",\n                textTransform: "none",');

fs.writeFileSync('components/lenders/AppBar.tsx', c);
console.log("Done");
