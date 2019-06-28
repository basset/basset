---
id: node-client
title: node-client
---

## API

### Creating new instance

```js
const basset = new Basset(bassetToken, staticDirectory, bassetUrl, baseUrl);
```

#### Parameters

* bassetToken\<string> - can be found within your project configuration in basset.

* staticDirectory\<string> - relative path to the directory containing assets (images, css files)

* bassetUrl\<string> - the URL for where basset is hosted eg: `basset.domain.ltd`

* baseURL\<string> - OPTIONAL - the base url used to create a relative path if the static directory is different that what is used in your snapshots. eg: static files are `static/assets` but they are referenced as `assets/` in HTML

### Start a build

```js
await basset.buildStart();
```

### Uploading snapshots

```js
await basset.uploadSnapshotFile(snapshot, filePath);
// or
await basset.uploadSnapshotSource(snapshot, source);

snapshot = {
  title: <string>,
  widths: <string>,
  selectors: <string>,
  browsers: <string>,
  hideSelectors: <string>,
}
```

#### Parameters

* snapshot\<object> - the snapshot object
* filePath\<string> - the path to the snapshot file (if it was saved to disk)
* source\<string> - a string containing the snapshot.

### Finishing the build

```js
await basset.buildFinish();
```
