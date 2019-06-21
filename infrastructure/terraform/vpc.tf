data "aws_availability_zones" "current" {}
resource "aws_vpc" "basset" {
  cidr_block = "10.0.0.0/16"
}
# ADD EGRESS AND INGRES
resource "aws_security_group" "basset_security_group" {
  name   = "basset_aws_security_group"
  vpc_id = "${aws_vpc.basset.id}"

  ingress {
    # TLS (change to whatever ports you need)
    from_port   = 443
    to_port     = 443
    protocol    = "6"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "6"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_subnet" "basset_subnet" {
  vpc_id                  = "${aws_vpc.basset.id}"
  cidr_block              = "${cidrsubnet(aws_vpc.basset.cidr_block, 8, 0)}"
  availability_zone       = "${data.aws_availability_zones.current.names[0]}"
  map_public_ip_on_launch = true
}
resource "aws_subnet" "basset_subnet_two" {
  vpc_id                  = "${aws_vpc.basset.id}"
  cidr_block              = "${cidrsubnet(aws_vpc.basset.cidr_block, 8, 1)}"
  availability_zone       = "${data.aws_availability_zones.current.names[1]}"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "basset_gw" {
  vpc_id = "${aws_vpc.basset.id}"
}

resource "aws_route_table" "public" {
  vpc_id = "${aws_vpc.basset.id}"

  # route to igw
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.basset_gw.id}"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = "${aws_subnet.basset_subnet.id}"
  route_table_id = "${aws_route_table.public.id}"
}

resource "aws_route_table_association" "public_two" {
  subnet_id      = "${aws_subnet.basset_subnet_two.id}"
  route_table_id = "${aws_route_table.public.id}"
}
