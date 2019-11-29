#!/bin/bash
chmod u+x /var/basset/start.sh
chmod u+x /var/basset/worker.sh
### Edit these ###
echo export OAUTH_GITHUB=1 > /var/basset/.env
echo export OAUTH_GITHUB_CLIENT_ID=ID >> /var/basset/.env
echo export OAUTH_GITHUB_CLIENT_SECRET=SECRET >> /var/basset/.env

echo export OAUTH_BITBUCKET=1 >> /var/basset/.env
echo export OAUTH_BITBUCKET_CLIENT_ID=ID >> /var/basset/.env
echo export OAUTH_BITBUCKET_CLIENT_SECRET=SECRET >> /var/basset/.env
echo export OAUTH_GITLAB=1 >> /var/basset/.env
echo export OAUTH_GITLAB_CLIENT_ID=ID >> /var/basset/.env
echo export OAUTH_GITLAB_CLIENT_SECRET=SECRET >> /var/basset/.env

echo export SAML_ENABLED=0 >> /var/basset/.env
echo export SAML_ENTRY_POINT=url >> /var/basset/.env
echo export SAML_ATTR_DISPLAY_NAME=displayname >> /var/basset/.env
echo export SAML_ATTR_PROFILE_IMAGE=profileimage >> /var/basset/.env
echo export SAML_ATTR_EMAIL=email >> /var/basset/.env
echo export SAML_ATTTR_ID=nameID >> /var/basset/.env
echo export SAML_CERT=nameID >> /var/basset/.env
echo export SAML_AUTHN_CONTEXT="" >> /var/basset/.env
echo export SAML_ISSUER="" >> /var/basset/.env

echo export NODE_ENV=production >> /var/basset/.env

# uncomment these to and set MAIL_USES_SES=0 to use SMTP
#echo export MAIL_HOST=localhost >> /var/basset/.env
#echo export MAIL_PORT=1025 >> /var/basset/.env
#echo export MAIL_PASSWORD=basset >> /var/basset/.env
#echo export MAIL_TLS=0 >> /var/basset/.env
echo export MAIL_EMAIL=hello@basset.io >> /var/basset/.env
echo export MAIL_USE_SES=1 >> /var/basset/.env

echo export DB_HOST=localhost >> /var/basset/.env
echo export DB_NAME=basset >> /var/basset/.env
echo export DB_USERNAME=basset >> /var/basset/.env
echo export DB_PASSWORD=password >> /var/basset/.env
echo export DB_USE_SSL=0 >> /var/basset/.env
echo export USE_DB_SESSION=1 >> /var/basset/.env

echo export BASSET_SECRET=BASSET_SECRET >> /var/basset/.env
echo export BASSET_PRIVATE=1 >> /var/basset/.env

### These are created based on the terraform config ###
echo export TOKEN=${token} >> /var/basset/.env
echo export BASSET_ORIGIN=https://${basset_url} >> /var/basset/.env
echo export BASSET_URL=https://${basset_url} >> /var/basset/.env
echo export S3_ENDPOINT=${s3_endpoint} >> /var/basset/.env
echo export SCREENSHOT_BUCKET=${screenshots_bucket} >> /var/basset/.env
echo export ASSETS_BUCKET=${assets_bucket} >> /var/basset/.env
echo export AWS_BATCH_JOB_DEFINITION=${definition_name} >> /var/basset/.env
echo export AWS_BATCH_JOB_QUEUE=${batch_queue_name} >> /var/basset/.env
echo export USE_SQS=1 >> /var/basset/.env
echo export SQS_BUILD_QUEUE_URL=${sqs_build_queue} >> /var/basset/.env
echo export SQS_TASK_QUEUE_URL=${sqs_task_queue} >> /var/basset/.env
echo export AWS_REGION=${aws_region} >> /var/basset/.env
echo export PRIVATE_ASSETS=${private_assets} >> /var/basset/.env
echo export PRIVATE_SCREENSHOTS=${private_screenshots} >> /var/basset/.env

chown -R ubuntu.ubuntu /var/basset