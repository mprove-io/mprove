const fs = require('fs');

const pathToStylesFile =
  'node_modules/@angular-devkit/build-angular/src/webpack/configs/styles.js';

try {
  let data = fs.readFileSync(pathToStylesFile, 'utf-8');
  data = data.replace(/\'tailwindcss\'/g, "'@tailwindcss/jit'");
  fs.writeFileSync(pathToStylesFile, data);
} catch {
  console.log('Post-install error');
}
