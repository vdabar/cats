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

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "cat-breeds-project-lambdas"
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

data "archive_file" "cats_bff" {
  type = "zip"

  source_dir  = "${var.deployment_package_dir}/apps/cats/bff"
  output_path = "${var.deployment_package_dir}/apps/cats/bff.zip"
}

resource "aws_s3_object" "cats_bff" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "cats-bff.zip"
  source = data.archive_file.cats_bff.output_path
  etag   = filemd5(data.archive_file.cats_bff.output_path)
}

resource "aws_lambda_function" "cats_bff" {
  function_name = "cats_bff"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
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

  route_key = "ANY /{proxy+}"
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
    name               = "NameIndex"
    hash_key           = "name"
    projection_type    = "ALL"
  }
}
