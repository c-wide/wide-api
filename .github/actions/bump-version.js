const fs = require('fs');

const newVersion = process.env.TGT_RELEASE_VERSION.replace('v', '');

const fileNames = ['fxmanifest.lua', 'package.json'];

fileNames.forEach((fileName) => {
  const file = fs.readFileSync(fileName, { encoding: 'utf8' });
  const newFileContent = file.replace(/(?<=version.*)\d\.\d\.\d/gm, newVersion);
  fs.writeFileSync(fileName, newFileContent);
});
