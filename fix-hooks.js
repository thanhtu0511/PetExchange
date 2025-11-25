const fs = require('fs');
const path = require('path');

// Thư mục cần quét
const PROJECT_DIR = path.join(process.cwd(), 'app'); // process.cwd() = root project

// File extensions cần quét
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Đọc toàn bộ file trong folder (đệ quy)
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (EXTENSIONS.includes(path.extname(file))) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Thêm comment gợi ý dependency cho useEffect / useCallback
function fixHooks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex tìm useEffect / useCallback
  const hookRegex =
    /(useEffect|useCallback)\s*\(\s*(async\s*)?\(?\s*([^\)]*)\)?\s*=>\s*\{([\s\S]*?)\},\s*\[([^\]]*)\]\s*\)/g;

  const newContent = content.replace(
    hookRegex,
    (match, hookName, asyncPrefix, args, body, deps) => {
      // Nếu dependency array rỗng
      if (deps.trim() === '') {
        modified = true;
        return `${hookName}(${asyncPrefix || ''}(${args}) => {${body}}, /* TODO: add missing dependencies */ [])`;
      }
      return match;
    },
  );

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated hook in: ${filePath}`);
  }
}

// Chạy quét
const allFiles = getAllFiles(PROJECT_DIR);

allFiles.forEach((file) => fixHooks(file));

console.log('🎯 Finished scanning all hooks.');
