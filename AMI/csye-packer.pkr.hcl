packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8, <2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
    googlecompute = {
      version = ">= 1.1.4"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}


variable "gcp_project_id" {
  type    = string
  default = env("GCP_PROJECT_ID")
}

variable "gcp_zone" {
  type    = string
  default = "us-central1-a"
}

variable "service_account_email" {
  type    = string
  default = env("GCP_SERVICE_ACCOUNT_EMAIL")
}


variable "aws_region" {
  type    = string
  default = env("AWS_REGION")
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "assg_name" {
  type    = string
  default = "csye6225"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "access_key" {
  type    = string
  default = env("AWS_ACCESS_KEY_ID")
}

variable "secret_key" {
  type    = string
  default = env("AWS_SECRET_ACCESS_KEY")
}

variable "DB_USER" {
  type    = string
  default = env("DB_USER")
}

variable "DB_PASSWORD" {
  type    = string
  default = env("DB_PASSWORD")
}

variable "DB_NAME" {
  type    = string
  default = env("DB_NAME")
}

variable "DB_LOGGING" {
  type    = string
  default = env("DB_LOGGING")
}

variable "SERVER_PORT" {
  type    = string
  default = env("SERVER_PORT")
}

variable "DB_DIALECT" {
  type    = string
  default = env("DB_DIALECT")
}

variable "DB_HOST" {
  type    = string
  default = env("DB_HOST")
}

variable "DB_PORT" {
  type    = string
  default = env("DB_PORT")
}


variable "AWS_DEMO_ACCOUNT_ID" {
  type    = string
  default = env("AWS_DEMO_ACCOUNT_ID")
}

variable "GCP_DEMO_PROJECT_ID" {
  type    = string
  default =  env("GCP_DEMO_PROJECT_ID")
}


source "amazon-ebs" "ubuntu" {
  ami_name        = "csye6225_${var.assg_name}_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  instance_type   = var.instance_type
  region          = var.aws_region
  ami_description = "AMI for CSYE6225"
  access_key      = var.access_key
  secret_key      = var.secret_key

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-noble-24.04-amd64-server-*"
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

  ami_users = [var.AWS_DEMO_ACCOUNT_ID]
}
source "googlecompute" "ubuntu" {
  project_id            = var.gcp_project_id
  source_image_family   = "ubuntu-2204-lts"
  image_name            = "csye6225-${var.assg_name}-${formatdate("YYYYMMDDhhmmss", timestamp())}"
  image_family          = "custom-images"
  service_account_email = var.service_account_email
  zone                  = var.gcp_zone
  ssh_username          = "packer"
  image_users           = ["projects/${var.GCP_DEMO_PROJECT_ID}"]
}

build {
  sources = ["source.amazon-ebs.ubuntu", "source.googlecompute.ubuntu"]

  provisioner "file" {
    source      = "./files/webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    environment_vars = [
      "DB_USER=${var.DB_USER}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_NAME=${var.DB_NAME}",
      "DB_DIALECT=${var.DB_DIALECT}",
      "DB_LOGGING=${var.DB_LOGGING}",
      "DB_PORT=${var.DB_PORT}",
      "DB_HOST=${var.DB_HOST}",
      "SERVER_PORT=${var.SERVER_PORT}"
    ]
    script = "db.sh"
  }

  provisioner "shell" {
    script = "node.sh"
  }

  provisioner "shell" {
    environment_vars = [
      "DB_USER=${var.DB_USER}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_NAME=${var.DB_NAME}",
      "DB_DIALECT=${var.DB_DIALECT}",
      "DB_LOGGING=${var.DB_LOGGING}",
      "DB_PORT=${var.DB_PORT}",
      "DB_HOST=${var.DB_HOST}",
      "SERVER_PORT=${var.SERVER_PORT}"
    ]
    script = "init.sh"
  }
}
