variable "domain_name" {
  type = "string"
}
variable "zone" {
  type = "string"
}

variable "cname" {
  type    = "string"
  default = "basset"
}
data "aws_route53_zone" "basset_domain" {
  name = "${var.zone}"
}

resource "aws_acm_certificate" "basset_cert" {
  domain_name       = "${var.domain_name}"
  validation_method = "DNS"
}

resource "aws_route53_record" "basset" {
  zone_id = "${data.aws_route53_zone.basset_domain.zone_id}"
  name    = "basset.${data.aws_route53_zone.basset_domain.name}"
  type    = "A"

  alias {
    name                   = "${aws_lb.basset_lb.dns_name}"
    zone_id                = "${aws_lb.basset_lb.zone_id}"
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "basset_cert_validation" {
  name    = "${aws_acm_certificate.basset_cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.basset_cert.domain_validation_options.0.resource_record_type}"
  zone_id = "${data.aws_route53_zone.basset_domain.id}"
  records = ["${aws_acm_certificate.basset_cert.domain_validation_options.0.resource_record_value}"]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "basset_cert" {
  certificate_arn         = "${aws_acm_certificate.basset_cert.arn}"
  validation_record_fqdns = ["${aws_route53_record.basset_cert_validation.fqdn}"]
}
