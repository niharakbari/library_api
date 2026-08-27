const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import { Library, Loader2, ChevronLeft, ChevronRight, Edit2, Check, X, Star, Trash2 } from 'lucide-react';/,
  `import { Library, Loader2, Download, ChevronLeft, ChevronRight, Edit2, Check, X, Star, Trash2 } from 'lucide-react';`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed MyLibrary imports');
