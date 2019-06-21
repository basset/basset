variable "ecr_name" {
  type = "string"
}
resource "aws_ecr_repository" "basset_ecr_repo" {
  name = "${var.ecr_name}"
}
