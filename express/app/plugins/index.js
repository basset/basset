// any .js files in this folder are imported (.js files inside directories are not imported)
const fs = require('fs').promises;

const plugins = [];

module.exports = {
  import: async function(app) {
    const files = await fs.readdir(__dirname);
    const jsFiles = files.filter(file => file.match(/\.js$/) && !file.match(/^index.js$/));
    for await (const file of jsFiles) {
      console.log(`[plugin] loading ${file}`);
      const plugin = require(`./${file.slice(0, -3)}`);
      if (typeof plugin.init === 'function') {
        await plugin.init(app);
      }
      plugins.push(plugin);
    }
  },
  beforeMiddleware: async function(app) {
    for await (const plugin of plugins) {
      if (typeof plugin.beforeMiddleware === 'function') {
        await plugin.beforeMiddleware(app);
      }
    }
  },
  afterMiddleware: async function(app) {
    for await (const plugin of plugins) {
      if (typeof plugin.afterMiddleware === 'function') {
        await  plugin.afterMiddleware(app);
      }
    }
  },
  beforeControllers: async function(app) {
    for await (const plugin of plugins) {
      if (typeof plugin.beforeControllers === 'function') {
        await plugin.beforeControllers(app);
      }
    }
  },
  afterControllers: async function(app) {
    for await (const plugin of plugins) {
      if (typeof plugin.afterControllers === 'function') {
        await plugin.afterControllers(app);
      }
    }
  },
};
