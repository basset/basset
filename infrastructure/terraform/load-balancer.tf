resource "aws_lb" "basset_lb" {
  name            = "basset-lb"
  security_groups = ["${aws_security_group.basset_security_group.id}"]
  subnets = [
    "${aws_subnet.basset_subnet.id}",
    "${aws_subnet.basset_subnet_two.id}",
  ]
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = "${aws_lb.basset_lb.arn}"
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "basset_app" {
  load_balancer_arn = "${aws_lb.basset_lb.arn}"
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = "${aws_acm_certificate_validation.basset_cert.certificate_arn}"

  default_action {
    type             = "forward"
    target_group_arn = "${aws_lb_target_group.basset_app.arn}"
  }

}

resource "aws_lb_target_group" "basset_app" {
  name     = "basse-lb-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = "${aws_vpc.basset.id}"
}

resource "aws_lb_target_group_attachment" "basset_app_attach" {
  target_group_arn = "${aws_lb_target_group.basset_app.arn}"
  target_id        = "${aws_instance.basset_app.id}"
  port             = 80
}
