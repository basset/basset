---
id: environmental-variables
title: Environmental variables
---

Here is a list of environmental variables Basset uses:

## Web service

| Name | Description |
| ---|---|
| `OUTH_GITHUB` | set to 1 to enable GitHub integration |
| `OAUTH_GITHUB_CLIENT_ID` | your GitHub Client ID |
| `OAUTH_GITHUB_CLIENT_SECRET` | your GitHub Client Secret |
| `MAIL_HOST` | the host used to send user emails |
| `MAIL_PORT` | the port used to connect to the host |
| `MAIL_EMAIL` | the email address used to send emails from |
| `MAIL_USE_SES` | set to 1 to enable mail via SES (otherwise SMTP is used) |
| `SES_ACCESS_KEY_ID` | optionally use different AWS id for SES |
| `SES_ACCESS_SECRET_KEY` | optionally use different AWS secret for SES |
| `DB_HOST` | the database host |
| `DB_NAME` | the database name |
| `DB_USERNAME` | the username used to authenticating to the database |
| `DB_PASSWORD` | the password used to authenticating to the database |
| `BASSET_SECRET` | should be a random generated key, used for cookies |
| `BASSET_ORIGIN` | CORS origin whitelist url |
| `BASSET_PRIVATE` | set to 0 to disable creating accounts and organizations, set to 1 otherwise |
| `USE_DB_SESSION` | set to 1 to use the database to store sessions (otherwise Redis is used) |
| `REDIS_HOST` | Redis host, used to store session |
| `REDIS_PORT` | Redis port |
| `AWS_BATCH_JOB_DEFINITION` | AWS Batch job definition name |
| `AWS_BATCH_JOB_QUEUE` | AWS Batch job queue name |
| `USE_SQS` | set to 1 to use SQS for queuing snapshots (otherwise RabbitMQ is used) |
| `SQS_TASK_QUEUE_URL` | SQS URL for running tasks |
| `AMPQ_TASK_QUEUE` | queue name to send tasks to (if you're not using SQS) |
| `NODE_ENV` | set to PRODUCTION unless you're testing or developing |

## Both services

| Name | Description |
| ---|---|
| `BASSET_URL` | URL for the web service |
| `S3_ENDPOINT` | endpoint for S3 |
| `AWS_ACCESS_KEY_ID` | access key for AWS |
| `AWS_SECRET_ACCESS_KEY` | secret key for AWS |
| `SCREENSHOT_BUCKET` | bucket for storing screenshots |
| `ASSETS_BUCKET` | bucket for storing files that are rendered |
| `SQS_BUILD_QUEUE_URL` | SQS URL for build snapshots |
| `AMPQ_HOST` | RabbitMQ host (if you're not using SQS) |
| `AMPQ_BUILD_QUEUE` | queue name to send tasks to (if you're not using SQS) |
| `TOKEN` | should be a random generated key, used for communicating between web service and diff service (can be generated running `node commands/generate-secret.js` in the `express` folder) |
