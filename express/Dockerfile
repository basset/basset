FROM node:10.14.1
EXPOSE 3000

WORKDIR /basset/

COPY . /basset/
RUN npm install --production

#
# Setup Environmental Variables
#

# OAUTH_GITHUB - 1 means on; 0 means off
ENV OAUTH_GITHUB 1
ENV OAUTH_GITHUB_CLIENT_ID githubId
ENV OAUTH_GITHUB_CLIENT_SECRET githubSecret

ENV MAIL_HOST emailServer
ENV MAIL_PORT 25
ENV MAIL_EMAIL hello@basset.io
ENV MAIL_USE_SES 1

ENV DB_HOST postgres
ENV DB_NAME dbName
ENV DB_USERNAME dbUsername
ENV DB_PASSWORD dbPassword

ENV BASSET_SECRET secret_code_here
ENV BASSET_ORIGIN http://app.basset.io
ENV BASSET_URL http://app.basset.io
# BASSET_PRIVATE - 0 means public site; 1 means private site
ENV BASSET_PRIVATE 0

ENV S3_ENDPOINT s3Url
ENV S3_ACCESS_KEY_ID s3Key
ENV S3_SECRET_ACCESS_KEY s3Secret
ENV SCREENSHOT_BUCKET bucketName
# 0 means screenshots use the s3 url; 1 means screenshots use the basset site to retrieve them
ENV PRIVATE_SCREENSHOTS 0
ENV ASSETS_BUCKET buckName
# 0 means assets use the s3 url; 1 means assets use the basset site to retrieve them
ENV PRIVATE_ASSETS 0
ENV AWS_BATCH_JOB_DEFINITION job-definition
ENV AWS_BATCH_JOB_QUEUE job-queue

ENV AMPQ_HOST amqp://host
ENV AMPQ_BUILD_QUEUE queue_name
ENV AMPQ_TASK_QUEUE queue_name
ENV SQS_URL sqsUrl
ENV SQS_BUILD_QUEUE_URL queue_name
ENV SQS_TASK_QUEUE_URL queue_name
ENV USE_SQS = 1

ENV TOKEN token

ENV NODE_ENV production


# run server

USER node

CMD ["node", "./bin/www"]