const DataLoader = require('dataloader');

const getModelLoader = (
  context,
  Model,
  { prop = 'id', loader = null } = {},
) => {
  return getOrSetLoader(context, Model, prop, loader, false);
};

const getRelatedModelLoader = (
  context,
  Model,
  { prop = 'id', loader = null } = {},
) => {
  return getOrSetLoader(context, Model, prop, loader, true);
};

const getOrSetLoader = (context, Model, prop, loader, many) => {
  const loadItem = getLoader(context, Model, prop);
  if (loadItem) {
    return loadItem;
  }
  let loaderFn;
  if (loader === null) {
    loaderFn = new DataLoader(async items => {
      const rows = await Model.query().whereIn(prop, items);
      primeOthersLoaders(context, Model, prop, rows);
      return items.map(item =>
        many
          ? rows.filter(r => r[prop] === item)
          : rows.find(r => r[prop] === item),
      );
    });
  } else {
    loaderFn = new DataLoader(loader);
  }
  setLoader(context, Model, prop, loaderFn);
  return loaderFn;
};

const getLoader = (context, Model, prop) => {
  if (!context.loaders[Model.name]) {
    context.loaders[Model.name] = {
      [prop]: null,
    };
  }
  return context.loaders[Model.name][prop];
};

const setLoader = (context, Model, prop, loader) => {
  context.loaders[Model.name][prop] = loader;
};

const primeOthersLoaders = (context, Model, propName, values) => {
  if (!context.loaders.hasOwnProperty(Model.name)) {
    return;
  }
  Object.entries(context.loaders[Model.name]).forEach(([prop, loader]) => {
    if (prop !== propName && values[0].hasOwnProperty(prop)) {
      for (let value of values) {
        loader.prime(value[prop], value);
      }
    }
  });
};

const primeLoaders = (context, Model, values) => {
  if (!context.loaders.hasOwnProperty(Model.name)) {
    return;
  }
  Object.entries(context.loaders[Model.name]).forEach(([prop, loader]) => {
    if (values[0].hasOwnProperty(prop)) {
      for (let value of values) {
        loader.prime(value[prop], value);
      }
    }
  });
};

module.exports = {
  getModelLoader,
  getRelatedModelLoader,
  primeLoaders,
  primeOthersLoaders,
  getLoader,
  setLoader,
};
