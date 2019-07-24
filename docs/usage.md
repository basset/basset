---
id: usage
title: Using basset
---

Basset provides an [API](api.md) that is used to:

* Start a build
* Upload assets
* Upload snapshots
* Finalize a build

To use basset to compare snapshots in your build the work flow is as follows:

1. Generate HTML snapshots as part of your testing - you can use any tool that generates static HTML.
   * Any references to other files in your HTML that are hosted on your site, must be a relative path—e.g., `<img src="static/images/basset.png">`.

2. Submit a POST request to the [`builds/start`](api.md#builds-start) endpoint with a dictionary/object of all assets required for the build. This includes any image, CSS and script file. The key for each entry will be the relative path and the value is the <abbr title="Secure Hashing Algorithm 1">SHA-1</abbr> of the file.
   * basset will cache the assets. In future builds you do not need to upload the same assets.

3. Upload each required asset to the [`builds/upload/asset`](api#builds-upload-asset) endpoint. The required assets were returned from the previous post.

4. Upload all snapshots for the build to the [`builds/upload/snapshot`](api#builds-upload-asset) endpoint.

5. Submit a POST request to the [`builds/finish`](api#builds-finish) endpoint.

Once the build has been submitted from step 1, it will appear in basset. You cannot view the build until it is finished building and diffing.

Currently, basset includes a client for [Node.js](https://nodejs.org/) for completing these steps. In the future, there will be clients for other languages.
