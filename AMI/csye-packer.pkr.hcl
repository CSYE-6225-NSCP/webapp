packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8, <2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = env("AWS_REGION")
}

variable "ssh_username" {
  type    = string
  default = env("SSH_USERNAME")
}

variable "assg_name" {
  type    = string
  default = env("ASSG_NAME")
}

variable "instance_type" {
  type    = string
  default = env("INSTANCE_TYPE")
}

variable "access_key" {
  type    = string
  default = env("AWS_ACCESS_KEY_ID")
}

variable "secret_key" {
  type    = string
  default = env("AWS_SECRET_ACCESS_KEY")
}

variable "db_user" {
  type    = string
  default = env("DB_USER")
}

variable "db_password" {
  type    = string
  default = env("DB_PASSWORD")
}

variable "db_name" {
  type    = string
  default = env("DB_NAME")
}

source "amazon-ebs" "ubuntu" {
  ami_name        = "csye6225_${var.assg_name}_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  instance_type   = var.instance_type
  region          = var.aws_region
  ami_description = "AMI for csye6225"
  access_key      = var.access_key
  secret_key      = var.secret_key
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = var.ssh_username

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 25
    volume_type           = "gp3"
    delete_on_termination = true
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = ".env"
    destination = "/opt/webapp/webapp-main/.env"
  }

  provisioner "file" {
    source      = "webapp.service"
    destination = "/tmp/"
  }

  provisioner "shell" {
    script = "db.sh"
  }

  provisioner "shell" {
    script = "node.sh"
  }

  provisioner "shell" {
    script = "init.sh"
  }
}
