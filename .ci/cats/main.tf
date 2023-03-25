terraform {
  backend "s3" {
    key    = "cat-breeds.tfstate"
    region = "eu-west-1"
    acl    = "bucket-owner-full-control"
  }
}


locals {
  build_artifacts_to_upload = flatten([
    for filename in fileset("${var.deployment_package_dir}/apps/cats/ui", "**") : {
      from        = "${var.deployment_package_dir}/apps/cats/ui/${filename}"
      source_hash = filemd5("${var.deployment_package_dir}/apps/cats/ui/${filename}")
      to          = "ui/cats/${filename}"
    }
  ])
  mime_types = {
    ".html" = "text/html",
    ".htm"  = "text/html",
    ".ico"  = "image/vnd.microsoft.icon",
    ".js"   = "text/javascript",
    ".mjs"  = "text/javascript",
    ".jpg"  = "image/jpeg",
    ".jpeg" = "image/jpeg",
    ".css"  = "text/css",
    ".png"  = "image/png",
    ".svg"  = "image/svg+xml",
    ".ttf"  = "font/ttf",
    ".woff" = "font/woff",
    ".json" = "application/json"
  }
}
provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "cats_project_bucket" {
  bucket = "cat-breeds-project-lambdas"
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.cats_project_bucket.id
  acl    = "private"
}

data "archive_file" "cats_bff" {
  type = "zip"

  source_dir  = "${var.deployment_package_dir}/apps/cats/bff"
  output_path = "${var.deployment_package_dir}/apps/cats/bff.zip"
}

resource "aws_s3_object" "cats_bff" {
  bucket = aws_s3_bucket.cats_project_bucket.id
  key    = "bff/cats-bff.zip"
  source = data.archive_file.cats_bff.output_path
  etag   = filemd5(data.archive_file.cats_bff.output_path)
}

resource "aws_lambda_function" "cats_bff" {
  function_name = "cats_bff"

  s3_bucket = aws_s3_bucket.cats_project_bucket.id
  s3_key    = aws_s3_object.cats_bff.key

  runtime = "nodejs16.x"
  handler = "main.handler"

  source_code_hash = data.archive_file.cats_bff.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
  environment {
    variables = {
      CATS_DYNAMO_TABLE = aws_dynamodb_table.cats_table.name
    }
  }
}

resource "aws_cloudwatch_log_group" "cats_bff" {
  name = "/aws/lambda/${aws_lambda_function.cats_bff.function_name}"

  retention_in_days = 3
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_apigatewayv2_api" "lambda" {
  name          = "serverless_lambda_gw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = "serverless_lambda_stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "cats_bff" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.cats_bff.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}
resource "aws_apigatewayv2_route" "cats_bff" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "ANY /api/cats"
  target    = "integrations/${aws_apigatewayv2_integration.cats_bff.id}"
}
resource "aws_apigatewayv2_route" "cats_bff_search" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "ANY /api/cats/search"
  target    = "integrations/${aws_apigatewayv2_integration.cats_bff.id}"
}
resource "aws_apigatewayv2_route" "cats_bff_id" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "GET /api/cats/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.cats_bff.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}"

  retention_in_days = 3
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cats_bff.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_iam_policy" "function_logging_policy" {
  name = "function-logging-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "dynamodb:*",
        ],
        Effect : "Allow",
        Resource : ["arn:aws:logs:*:*:*", aws_dynamodb_table.cats_table.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "function_logging_policy_attachment" {
  role       = aws_iam_role.lambda_exec.id
  policy_arn = aws_iam_policy.function_logging_policy.arn
}

resource "aws_dynamodb_table" "cats_table" {
  name         = "cats-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  global_secondary_index {
    name            = "NameIndex"
    hash_key        = "name"
    projection_type = "ALL"
  }
}
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "cats-ui OAI"
}
resource "aws_cloudfront_distribution" "cf_distribution" {
  origin {
    domain_name = aws_s3_bucket.cats_project_bucket.bucket_regional_domain_name
    origin_path = "/ui/cats"
    origin_id   = "website"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  origin {
    domain_name = "${aws_apigatewayv2_api.lambda.id}.execute-api.eu-west-1.amazonaws.com"
    origin_id   = "api"
    origin_path = "/serverless_lambda_stage"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
        "TLSv1",
        "TLSv1.1",
        "TLSv1.2"
      ]
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "website"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  ordered_cache_behavior {
    allowed_methods          = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods           = ["GET", "HEAD"]
    path_pattern             = "api/*"
    target_origin_id         = "api"
    viewer_protocol_policy   = "allow-all"
    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "website"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  retain_on_delete = true

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
data "aws_iam_policy_document" "react_app_s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.cats_project_bucket.arn}/ui/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "react_app_bucket_policy" {
  bucket = aws_s3_bucket.cats_project_bucket.id
  policy = data.aws_iam_policy_document.react_app_s3_policy.json
}

resource "aws_s3_object" "remove_and_upload_to_s3" {
  for_each = {
    for upload in local.build_artifacts_to_upload : "${upload.from}/${upload.to}" => upload
  }

  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.value.from), null)
  source_hash  = each.value.source_hash
  bucket       = aws_s3_bucket.cats_project_bucket.id
  key          = each.value.to
  source       = each.value.from
}
