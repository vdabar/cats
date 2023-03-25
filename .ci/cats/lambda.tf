

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
