const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'types.d.ts');
const regex = /^(declare class )/gm;

fs.readFile(file, 'utf8', (err, content) => {
  if (err !== null) {
    throw err;
  }
  if (content.match(regex)) {
    fs.writeFile(file, content.replace(regex, 'export $1'), error => {
      if (error !== null) {
        throw error;
      }
    });
  }
});
