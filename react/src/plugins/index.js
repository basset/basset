const cache = {};

function importAll (r) {
  r.keys().forEach(key => {
    cache[key] = r(key);
  });
}

importAll(require.context('./', true, /^\.\/(?!index\.jsx?).+\.jsx?/));

export default async function initializePlugins({ routes, customUserMenu, store}) {
  for (const key in cache) {
    const mod = cache[key];
    if (mod.default && typeof mod.default === 'function') {
      await mod.default({
        routes,
        customUserMenu,
        store
      });
    }
  }
}
