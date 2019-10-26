---
id: api
title: API
---

> Using the API requires an Authorization header which should be to set to `Authorization: Token YOUR_PROJECT_TOKEN`

## `/builds/start`

* Description: Create a build
* Method: `POST`
* Content-Type: `application/json`
* Body data:

  ```json
  {
    "branch": <string>,
    "commitSha": <string>,
    "commitMessage": <string>,
    "committerName": <string>,
    "committerEmail": <string>,
    "commitDate": <string>,
    "authorName": <string>,
    "authorEmail": <string>,
    "authorDate": <string>,
    "assets": {
      <string>: <string>
    }
  }
  ```

  > `assets` is an object of relative paths as keys and the file SHA1 (secure hashing algorithm 1) as their values.
  > assets are only used for web projects
  > 
  > eg `"path/to/file.png": "SHA1"`
  >
  > **These are any files required for your site to be rendered**

* Success response:
  * Status code: `200`
  * Content:

    ```json
    {
      "id": <string>,
      "assets": {
        <string>: <string>
      }
    }
    ```

    > `assets` is the missing assets that are needed to render the build
    >
    > **You only need to upload these assets**

## `/builds/upload/snapshot`

> this endpoint is only for web projects

* Description: Upload a snapshot (static html)
* Method: `POST`
* Content-type: `multipart/form-data`
* Additional Header parameters:

  ```http
  X-BUILD-ID: buildId
  X-RELATIVE-PATH: path/to/file.ext
  X-SHA: SHA_1
  ```

* Form data:

  ```json
  {
    "widths": <string>,
    "title": <string>,
    "selectors": <string>,
    "hideSelectors": <string>,
    "browsers": <string>
  }
  ```

  > To send multiple `widths`, `browsers` and `hideSelectors` comma separate each value.

* Success response:
  * Status code: `200`
  * Content:

    ```json
    {
      "uploaded": <boolean>
    }
    ```

## `/builds/upload/asset`

> this endpoint is only for web projects

* Description: Upload an asset file (image, css, etc..)
* Method: `POST`
* Content-type: `multipart/form-data`
* Additional header parameters:

  ```http
  X-BUILD-ID: buildId
  X-RELATIVE-PATH: path/to/file.ext
  X-SHA: SHA_1
  ```

* Form data:

  ```json
  {
    "relativePath": <string>
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    ```json
      {
        "uploaded": <boolean>
      }
    ```

## `/builds/upload/image`

> this endpoint is only for image projects

* Description: Upload a screen (image)
* Method: `POST`
* Content-type: `multipart/form-data`
* Additional Header parameters:

  ```http
  X-BUILD-ID: buildId
  X-SHA: SHA_1
  ```

* Form data:

  ```json
  {
    "title": <string>,
  }
  ```

  > To send multiple `widths`, `browsers` and `hideSelectors` comma separate each value.

* Success response:
  * Status code: `200`
  * Content:

    ```json
    {
      "uploaded": <boolean>
    }
    ```

## `/builds/finish`

* Description: Signals end of uploads, build can be rendered and diffed
* Method: `POST`
* Content-Type: `application/json`
* Body data:

  ```json
  {
    "buildId": <string>
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    ```json
      {
        "submitted": <boolean>
      }
    ```
