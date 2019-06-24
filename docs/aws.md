---
id: aws
title: Setup on AWS
---

## AWS infrastructure

The following infrastructure is required to run basset on AWS:

* 2 S3 buckets for storing snapshots and assets
* 1 EC2 instance which hosts the app, a task runner and PostgreSQL
* Route53 for hosting a sub-domain
* Application Load balancer to enable https
* SQS for queueing snapshot rendering and diffing
* Batch for running the rendering and diffing
  * Batch is setup to use Spot Fleet with m3.large, m4.large, m4a.large, c4.large and c5.large with 90% discount

## Configure and deploy

1. Ensure your aws credentials are setup
2. Follow step 1 - 2 from [Local installation](installation.md)
3. Update the file at `infrastructure/packer/vars.json`
   > Modify the file at `infrastructure/playbook/roles/basset/vars/main.yml` if you are restoring from a database dump.
4. Navigate to the `express` folder and run:

    ```shell-session
    zip -r --exclude='node_modules/*' app.zip .
    ```

5. Navigate to the `infrastructure/packer` folder and run:

    ```shell-session
    packer build -var-file=./vars.json basset.json
    ```

6. Update the file at `infrastructure/terraform/userdata.tpl` which will be used to set the environment [variables](environmental-variables.md) for the ec2 instance.
7. Update the file at  `infrastructure/terraform/terraform.tfvars`
8. Navigate to the `infrastructure/terraform` folder and run:

    ```shell-session
    terraform plan
    terraform apply
    ```

9. Get the ECR url and ECR name from your AWS management console or from your terraform data files
10. Login to ECR by running:

    ```shell-session
    aws ecr get-login --no-include-email --region region
    ```

11. Navigate to the `diff` folder:
12. Edit the `Docker` file to setup your environment [variables](environmental-variables.md)
13. While still in the `diff` folder run:

    ```shell-session
    DOCKER_ECR_NAME=ecr_name DOCKER_REPO_URL=ecr_repo_url \
    make build && make tag && make push
    ```
