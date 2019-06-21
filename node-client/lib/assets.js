const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);

const { generateFileHash } = require('./generate-hash');

const getAssets = (staticDir, relativeDir) => {
  return walk(staticDir, relativeDir);
};

const walk = async (staticDir, relativeDir) => {
  const dir = path.join(process.cwd(), staticDir, relativeDir);
  let assets = {};
  const files = await readdir(dir, { withFileTypes: true });
  const filteredFilters = files.filter(
    f => path.extname(f.name) !== '.js' && path.extname(f.name) !== '.map',
  );
  for await (const file of filteredFilters) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      const subAssets = await walk(
        staticDir,
        path.join(relativeDir, file.name),
      );
      assets = {
        ...assets,
        ...subAssets,
      };
      continue;
    }

    const sha = await generateFileHash(filePath);
    const relativePath = path.join(relativeDir, file.name);
    assets[relativePath] = sha;
  }
  return assets;
};

module.exports = {
  getAssets,
  walk,
};
