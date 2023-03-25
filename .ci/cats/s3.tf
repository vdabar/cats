resource "aws_s3_bucket" "cats_project_bucket" {
  bucket = "cat-breeds-project-lambdas"
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

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.cats_project_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_policy" "react_app_bucket_policy" {
  bucket = aws_s3_bucket.cats_project_bucket.id
  policy = data.aws_iam_policy_document.react_app_s3_policy.json
}
