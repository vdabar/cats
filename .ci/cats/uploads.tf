
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
