variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "eu-west-1"
}

variable "deployment_package_dir" {
  description = "directory of the builds"
  type        = string
}
