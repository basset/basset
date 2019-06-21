variable "compute_name" {
  type    = "string"
  default = "basset-batch-compute"
}


variable "batch_queue_name" {
  type    = "string"
  default = "basset-batch-queue"
}

variable "definition_name" {
  type    = "string"
  default = "basset-batch-defintion"
}
variable "token" {
  type = "string"
}

# Compute enivronment

resource "aws_iam_role" "ecs_instance_role" {
  name = "ecs_instance_role"

  assume_role_policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
        "Service": "ec2.amazonaws.com"
        }
    }
    ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role" {
  role = "${aws_iam_role.ecs_instance_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_role" {
  name = "ecs_instance_role"
  role = "${aws_iam_role.ecs_instance_role.name}"
}

resource "aws_iam_role" "aws_batch_service_role" {
  name = "basset_aws_batch_service_role"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "batch.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "aws_batch_service_role" {
  role       = "${aws_iam_role.aws_batch_service_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole"
}

resource "aws_iam_role" "basset_spot_fleet_role" {
  name               = "basset_ec2_spot_fleet_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "spotfleet.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}
resource "aws_iam_role_policy_attachment" "basset_spot_fleet_role" {
  role = "${aws_iam_role.basset_spot_fleet_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetRole"
}

resource "aws_iam_role_policy_attachment" "basset_spot_fleet_tagging" {
  role = "${aws_iam_role.basset_spot_fleet_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole"
}

resource "aws_iam_policy" "basset_create_service_linked_role" {
  name = "test-policy"
  description = "A test policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Sid": "VisualEditor0",
          "Effect": "Allow",
          "Action": "iam:CreateServiceLinkedRole",
          "Resource": "*"
      }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_create_service_linked_role" {
  role       = "${aws_iam_role.basset_spot_fleet_role.name}"
  policy_arn = "${aws_iam_policy.basset_create_service_linked_role.arn}"
}

resource "aws_batch_compute_environment" "basset_compute" {
  compute_environment_name = "${var.compute_name}"

  compute_resources {
    instance_role = "${aws_iam_instance_profile.ecs_instance_role.arn}"

    instance_type = [
      "c4.large", "c5.large", "m3.medium", "m4.large", "m5.large", "m5a.large"
    ]

    max_vcpus      = 10
    desired_vcpus  = 2
    min_vcpus      = 1
    bid_percentage = 90

    security_group_ids = [
      "${aws_security_group.basset_security_group.id}",
    ]

    subnets = [
      "${aws_subnet.basset_subnet.id}",
    ]

    type = "SPOT"

    spot_iam_fleet_role = "${aws_iam_role.basset_spot_fleet_role.arn}"
  }

  service_role = "${aws_iam_role.aws_batch_service_role.arn}"
  type         = "MANAGED"
  depends_on   = ["aws_iam_role_policy_attachment.aws_batch_service_role"]
}

# Queue

resource "aws_batch_job_queue" "basset_queue" {
  name     = "${var.batch_queue_name}"
  state    = "ENABLED"
  priority = 1
  compute_environments = [
    "${aws_batch_compute_environment.basset_compute.arn}",
  ]
}

resource "aws_iam_role" "basset_container_role" {
  name               = "basset_diff_container_role"
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy" "basset_container_role_policy" {
  name = "basset_container_role_policy"
  role = "${aws_iam_role.basset_container_role.id}"
  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "sqs:*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Resource": "*"
        }
    ]
}
POLICY
}

# Defintion

resource "aws_batch_job_definition" "basset_definition" {
  name = "${var.definition_name}"
  type = "container"

  container_properties = <<CONTAINER_PROPERTIES
{
    "command": ["workers.sqs"],
    "image": "${aws_ecr_repository.basset_ecr_repo.repository_url}:latest",
    "memory": 2048,
    "jobRoleArn": "${aws_iam_role.basset_container_role.arn}",
    "vcpus": 1,
    "environment": [
        {"name": "BASSET_URL", "value": "http://${aws_instance.basset_app.private_ip}"},
        {"name": "S3_ENDPOINT", "value": "https://s3.${aws_s3_bucket.screenshots_bucket.region}.amazonaws.com"},
        {"name": "SCREENSHOT_BUCKET", "value": "${var.screenshots_bucket}"},
        {"name": "ASSETS_BUCKET", "value": "${var.assets_bucket}"},
        {"name": "TOKEN", "value": "${var.token}"},
        {"name": "SQS_BUILD_QUEUE_URL", "value": "${aws_sqs_queue.basset_build_queue.id}"},
        {"name": "AWS_REGION", "value": "${aws_s3_bucket.screenshots_bucket.region}"},
        {"name": "AWS_DEFAULT_REGION", "value": "${aws_s3_bucket.screenshots_bucket.region}"}
    ],
    "timeout": {
      "attempt_duration_seconds": 300
    },
    "user": "python",
    "mountPoints": [
      {
        "sourceVolume": "shm",
        "containerPath": "/dev/shm",
        "readOnly": false
      }
    ],
    "volumes": [
    {
      "name": "shm",
      "host": {
        "sourcePath": "/dev/shm"
      }
    }
  ]
}
CONTAINER_PROPERTIES
}
