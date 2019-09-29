---
id: python-client
title: python-client
---


## Installation

```shell
pip install basset-python-client
```
## API

### Creating new instance

```python
from basset_client.basset import Basset

basset = Basset(basset_token, static_dir, basset_url, base_url)
```

#### Parameters

* basset_token\<string> - can be found within your project configuration in basset.

* static_dir\<string> - relative path to the directory containing assets (images, css files)

* basset_url\<string> - the URL for where basset is hosted eg: `basset.domain.ltd`

* base_url\<string> - OPTIONAL - the base url used to create a relative path if the static directory is different that what is used in your snapshots. eg: static files are `static/assets` but they are referenced as `assets/` in HTML

### Start a build

```python
basset.build_start()
```

### Uploading snapshots

```python
basset.upload_snapshot_file(snapshot, file_path);
# or
basset.upload_snapshot_source(snapshot, source);


## snapshot is a tuple of strings
snapshot = [
  widths,
  title,
  browsers,
  selectors,
  hide_selectors,
]
```

#### Parameters

* snapshot\<tuple> - the snapshot represented a tuple of strings
* file_path\<string> - the path to the snapshot file (if it was saved to disk)
* source\<string> - a string containing the snapshot.

### Finishing the build

```python
basset.build_finish();
```
