# Basset

Visual regression testing

## What's Basset

Basset is an open source visual regression testing service. Basset allows you to easily integrate visual regression testing into your continuous integration. Since basset's code is open source, you can host the service on a provider or run it on premise.

## Getting started

1. [Running Basset](#running-basset)
2. [Using Basset in your tests](#using-basset)

## Running Basset

### Prerequisites

* PostgreSQL version 10.
* Amazon S3 or a compliant service like [minio](http://min.io).
* RabbitMQ or SQS
* Docker (optional)
* Packer (optional)
* Ansible (optional)
* Terraform (optional)

If you choose not to use docker or ansible then you will also need to install:

* OpenCV
* Node v10.14.1
* Python 3.6.5
* Firefox and geckodriver
* Chrome and chromedriver

### Installation

Basset has two services:

* A Node web service which allows you to configure, view and approve snapshots.
* A Python diff service which renders static HTML into images and then renders a image showing the differences.

#### Local installation

1. Checkout the repository
2. Navigate to the `react` folder and run:

    ```bash
    npm install --production
    npm run build
    cp dist/* ../express/static/dist/
    ```

3. Navigate to the `express` folder
4. Edit the Dockerfile to setup your environment [variables](#environmental-variables)
5. Run:

    ```bash
    docker build --tag=basset .
    docker run --network="basset-network" --name="basset" basset
    docker exec -t basset node ./commands/migrate
    ```

6. Navigate to the `diff` folder:
7. Edit the Docker to setup your environment [variables](#environmental-variables)
8. Run:

    ```bash
    docker build --tag=basset-diff
    docker run --network="basset-network" --name="basset-diff" basset-diff workers.rabbitmq
    ```

#### Hosting on AWS

Currently Basset is configured with:

* 2 S3 buckets for storing snapshots and assets
* 1 EC2 instance which hosts the app and PostgreSQL
* Route53 for hosting a sub-domain
* Application Load balancer to enable https
* SQS for queueing snapshot rendering and diffing
* Batch for running the rendering and diffing
  * Batch is setup to use Spot Fleet with m3.large, m4.large, m4a.large, c4.large and c5.large with 90% discount

### Instructions

1. Ensure your aws credentials are setup
2. Follow step 1 - 2 from Local installation
3. Update the file at `infrastructure/packer/vars.json` you need to enter:
   1. Database password
   2. Default user email and password
   3. Organization name (optional)
4. Navigate to the `react` folder and run:

    ```bash
      rm -rf ./dist/*
      npm run build
      rm -rf ../express/static/dist/*
      cp dist/* ../express/static/dist/
    ```

5. Navigate to the `express` folder and run:

    ```bash
    zip -r --exclude='node_modules/*' app.zip .
    ```

6. Navigate to the `infrastructure/packer` folder and run:

    ```bash
    packer build -var-file=./vars.json basset.json
    ```

7. Update the file at `infrastructure/terraform/userdata.tpl` which will be used to set the environment [variables](#environmental-variables) for the ec2 instance.
8. Update the file at  `infrastructure/terraform/terraform.tfvars`
9. Navigate to the `infrastructure/terraform` folder and run:

    ```bash
    terraform plan
    terraform apply
    ```

10. Get the ECR url from your aws site or from your terraform data files
11. Navigate to the `diff` folder:
12. Edit the Docker to setup your environment [variables](#environmental-variables)
13. Run:

    ```bash
    DOCKER_ECR_NAME=[ecr_name] make build
    DOCKER_ECR_NAME=[ecr_name] DOCKER_REPO_URL=[ecr_repo_url] make tag
    DOCKER_ECR_NAME=[ecr_name] DOCKER_REPO_URL=[ecr_repo_url] make push
    ```

### Environmental Variables

---

Here is a list of environmental variables Basset uses:

#### Variables used by web service

* OAUTH_GITHUB - set to 1 to enable Github integration
* OAUTH_GITHUB_CLIENT_ID - your Github Client ID
* OAUTH_GITHUB_CLIENT_SECRET - your Github Client Secret
* MAIL_HOST - the host used to send user emails
* MAIL_PORT - the port used to connect to the host
* MAIL_EMAIL - the email address used to send emails from
* MAIL_USE_SES - set to 1 to enable mail via SES (otherwise SMTP is used)
* SES_ACCESS_KEY_ID - optionally use different AWS id for SES
* SES_ACCESS_SECRET_KEY - optionally use different AWS secret for SES
* DB_HOST - the database host
* DB_NAME - the database name
* DB_USERNAME - the username used to authenticating to the database
* DB_PASSWORD - the password used to authenticating to the database
* BASSET_SECRET - should be a random generated key, used for cookies
* BASSET_ORIGIN - CORS origin whitelist url
* BASSET_PRIVATE - set to 0 to disable creating accounts and organizations otherwise set to 1
* USE_DB_SESSION - set to 1 to use the database to store sessions (otherwise Redis is used)
* REDIS_HOST - Redis host, used to store session
* REDIS_PORT - Redis port
* AWS_BATCH_JOB_DEFINITION - AWS Batch job definition name
* AWS_BATCH_JOB_QUEUE - AWS Batch job queue name
* USE_SQS - set to 1 to use SQS for queuing snapshots (otherwise RabbitMQ is used)
* SQS_TASK_QUEUE_URL - SQS URL for running tasks
* AMPQ_TASK_QUEUE - queue name to send tasks to (if you're not using SQS)
* NODE_ENV - set to PRODUCTION unless you're testing or developing

#### Variables used by both services

* BASSET_URL - URL for the web service
* S3_ENDPOINT - endpoint for s3
* AWS_ACCESS_KEY_ID - access key for aws
* AWS_SECRET_ACCESS_KEY - secret key for aws
* SCREENSHOT_BUCKET - bucket for storing screenshots
* ASSETS_BUCKET - bucket for storing files that are rendered
* SQS_BUILD_QUEUE_URL - SQS URL for build snapshots
* AMPQ_HOST - RabbitMQ host (if you're not using SQS)
* AMPQ_BUILD_QUEUE - queue name to send tasks to (if you're not using SQS)
* TOKEN - should be a random generated key, used for communicating between web service and diff service (can be generated running `node commands/generate-secret.js` in the `express` folder)

## Using basset

* Currently there is a node-client that can be used for testing on Node
* You can see an example within the `express/tests/selenium` folder
* Basset has a simple API which can be used to build your own client

## APIs

---

### `/builds/start`

* **Description:** Create a build
* **Method:** `POST`
* **Content-Type:** `application/json`
* Header parameters:

  ```:plain
  Authorization: Token [projectTokenKey]
  ```

* Body data:

  _assets is an object of relative paths as keys and the file SHA_1 as their values_

  ```:javascript
  {
    branch: <string>
    commitSha: <string>
    commitMessage: <string>
    committerName: <string>
    committerEmail: <string>
    commitDate: <string>
    authorName: <string>
    authorEmail: <string>
    authorDate: <string>
    assets: {
      <string>: <string>,
      'path/to/file.png': 'cf23df'
    }
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    _build id and a list of missing assets are returned_
    * this allow you to only upload only the assets that are missing for this build

    ```:javascript
      {
        id: <string>,
        assets: {
          <string>: <string>
        }
      }
    ```

### `/builds/upload/snapshot`

* **Description:** Upload a snapshot (static html)
* **Method:** `POST`
* **Content-type:** `multipart/form-data`
* Header parameters:

  ```:plain
  Authorization: Token [projectTokenKey]
  X-BUILD-ID: buildId
  X-RELATIVE-PATH: path/to/file.ext
  X-SHA: SHA_1
  ```

* Form data:

  _multiple values are comma separated_

  ```:javascript
  {
    widths: <string>
    title: <string>
    selectors: <string>
    hideSelectors: <string>
    browsers: <string>
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    ```:javascript
      {
        uploaded: <boolean>
      }
    ```

### `/builds/upload/asset`

* **Description:** Upload an asset file (image, css, etc..)
* **Method:** `POST`
* **Content-type:** `multipart/form-data`
* Header parameters:

  ```:plain
  Authorization: Token [projectTokenKey]
  X-BUILD-ID: buildId
  X-RELATIVE-PATH: path/to/file.ext
  X-SHA: SHA_1
  ```

* Form data:

  ```:javascript
  {
    relativePath: <string>
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    ```:javascript
      {
        uploaded: <boolean>
      }
    ```

### `/builds/finish`

* **Description:** Signals end of uploads, build can be rendered and diffed
* **Method:** `POST`
* **Content-Type:** `application/json`
* Header parameters:

  ```:plain
  Authorization: Token [projectTokenKey]
  ```

* Body data:

  _assets is an object of relative paths as keys and the file SHA_1 as their values_

  ```:javascript
  {
    buildId: <string>
  }
  ```

* Success response:
  * Status code: `200`
  * Content:

    ```:javascript
      {
        submitted: <boolean>
      }
    ```
