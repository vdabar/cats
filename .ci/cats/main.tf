terraform {
  backend "s3" {
    key    = "cat-breeds.tfstate"
    region = "eu-west-1"
    acl    = "bucket-owner-full-control"
  }
}

provider "aws" {
  region = var.aws_region
}
