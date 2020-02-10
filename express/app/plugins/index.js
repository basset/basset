// any .js files in this folder are imported (.js files inside directories are not imported)
const fs = require('fs').promises;

module.exports = async function importPlugins(app) {
  const files = await fs.readdir(__dirname);
  const jsFiles = files.filter(file => file.match(/\.js$/) && !file.match(/^index.js$/));
  for await (const file of jsFiles) {
    console.log(`[plugin] loading ${file}`);
    const init = require(`./${file.slice(0, -3)}`);
    if (typeof init === 'function') {
      await init(app);
    }
  }
};
