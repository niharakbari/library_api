const fs = require('fs');
const file = 'frontend/src/pages/MyLibrary.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /style=\{\{\s*backgroundColor:\s*'var\(--error\)',\s*borderColor:\s*'var\(--error\)'\s*\}\}/g;
const newStyle = "style={{ backgroundColor: '#e55a5a', color: '#ffffff', borderColor: '#e55a5a' }}";

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, newStyle);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Button color fixed!");
} else {
    console.log("Regex didn't match.");
}
