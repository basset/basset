export default function examplePlugin({routes, customUserMenu, store}) {
  return new Promise((resolve, reject) => {
    console.log(store);
    return resolve();
  })
}