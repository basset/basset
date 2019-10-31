---
id: usage
title: Using basset
---

Basset provides an [API](/api) that is used to:

* Start a build
* Upload assets
* Upload snapshots
* Finalize a build

To use basset to compare snapshots in your build the work flow is as follows:

1. Generate snapshots in your testing - you can use any tool that generates static HTML

> Any references to other files in your HTML that are hosted on your site must be a relative path ie: \<img src="static/images/basset.png"\>
> basset will cache the assets so in future builds you do not need to upload the same assets

1. Submit a POST request to the [`builds/start`](/api/#operation/createBuild) endpoint with a dictionary/object of all the assets required for the build. These include any image, css, script files. The key for each entry will be the relative path and the value is the SHA1 (Secure Hashing Algorithm 1) of the file.

2. Upload each required asset to the [`builds/upload/asset`](/api/#operation/uploadAsset) endpoint. The required assets were returned from the previous post.

3. Upload all snapshots for the build to the [`builds/upload/snapshot`](/api/#operation/uploadSnapshot) endpoint.

4. Submit a POST request to the [`builds/finish`](/api/#operation/finishBuild) end point.

Once the build has been submitted from step 1, it will appear in basset. You cannot view the build until it is finished building and diffing

Currently basset includes a client for node for completing these steps. In the future there will be clients for other languages.
