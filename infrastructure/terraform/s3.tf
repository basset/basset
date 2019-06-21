variable "assets_bucket" {
  type = "string"
}

variable "screenshots_bucket" {
  type = "string"
}

resource "aws_s3_bucket" "screenshots_bucket" {
  bucket = "${var.screenshots_bucket}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetObject",
        "s3:GetObjectAcl"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.screenshots_bucket}/*",
      "Principal": "*"
    }
  ]
}
POLICY
}

resource "aws_s3_bucket" "assets_bucket" {
  bucket = "${var.assets_bucket}"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}
