const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/lenders/AppBar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(
  'import { Link, useNavigate, useLocation } from "react-router-dom";',
  'import Link from "next/link";\nimport { useRouter, usePathname } from "next/navigation";'
);

content = content.replace(
  'import { pages, products } from "../../data/Data";',
  'import { pages, products } from "../../lib/Data";'
);

// Mock Utility and API
content = content.replace(
  'import { Utility } from "../utility";',
  `const Utility = () => ({
  getLocalStorage: (key) => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(key);
      try { return JSON.parse(val); } catch (e) { return val; }
    }
    return null;
  },
  remLocalStorage: (key) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  },
  groupNotificationsByDate: (notifs) => ({})
});`
);

content = content.replace(
  'import API from "../../apis";',
  `const API = {
  NotificationAPI: {
    markAsRead: async () => ({ data: { status: "Success" } }),
    markAllAsRead: async () => ({ data: { status: "Success" } }),
    getNotification: async () => Promise.resolve({ data: { status: "Success", data: { rows: [] } } })
  }
};`
);

// Hooks
content = content.replace(/useNavigate/g, 'useRouter');
content = content.replace(/useLocation/g, 'usePathname');
content = content.replace(/const location = usePathname\(\);/g, 'const pathname = usePathname();');
content = content.replace(/const \{ pathname \} = usePathname\(\);/g, ''); 
content = content.replace(/\[location\]/g, '[pathname]');

// Link component
content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
content = content.replace(/<Button([^>]+)component=\{Link\}([^>]+)to=/g, '<Button$1component={Link}$2href=');

// Fix "use client"
content = '"use client";\n' + content;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Appbar migrated to Next.js successfully!');
