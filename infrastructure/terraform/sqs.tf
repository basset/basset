resource "aws_sqs_queue" "basset_build_queue" {
  name                       = "basset-render-diff.fifo"
  fifo_queue                 = true
  visibility_timeout_seconds = 120
}

resource "aws_sqs_queue" "basset_task_queue" {
  name                       = "basset-task"
  visibility_timeout_seconds = 120
}
