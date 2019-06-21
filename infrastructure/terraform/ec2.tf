variable "key_name" {
  type = "string"
}
data "aws_ami" "basset_app" {
  most_recent = true

  filter {
    name   = "name"
    values = ["basset-app-*"]
  }
  owners = ["self"]
}

resource "aws_iam_role" "basset_app_role" {
  name               = "basset_app_Role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_role_policy" "basset_ec2_policy" {
  name = "basset_ec2_policy"
  role = "${aws_iam_role.basset_app_role.id}"
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
    },
    {
      "Effect": "Allow",
      "Action": "batch:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "ses:*",
      "Resource": "*"
    }
  ]
}
POLICY
}
resource "aws_iam_instance_profile" "basset_profile" {
  name = "basset_profile"
  role = "${aws_iam_role.basset_app_role.name}"
}

data "template_file" "script" {
  template = "${file("${path.module}/userdata.tpl")}"
  vars = {
    token              = "${var.token}"
    screenshots_bucket = "${var.screenshots_bucket}"
    assets_bucket      = "${var.assets_bucket}"
    definition_name    = "${var.definition_name}"
    batch_queue_name   = "${var.batch_queue_name}"
    sqs_build_queue    = "${aws_sqs_queue.basset_build_queue.id}"
    sqs_task_queue     = "${aws_sqs_queue.basset_task_queue.id}"
    basset_url         = "${aws_route53_record.basset.fqdn}"
    s3_endpoint        = "https://s3.${aws_s3_bucket.screenshots_bucket.region}.amazonaws.com"
    aws_region         = "${aws_s3_bucket.screenshots_bucket.region}"
  }
}

resource "aws_instance" "basset_app" {
  ami                  = "${data.aws_ami.basset_app.image_id}"
  instance_type        = "t2.micro"
  key_name             = "${var.key_name}"
  user_data            = "${data.template_file.script.rendered}"
  iam_instance_profile = "${aws_iam_instance_profile.basset_profile.name}"

  vpc_security_group_ids = [
    "${aws_security_group.basset_security_group.id}"
  ]
  associate_public_ip_address = true

  subnet_id = "${aws_subnet.basset_subnet.id}"
}
