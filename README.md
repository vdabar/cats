# Cats

##

demo: https://d2tbq4dhxyybie.cloudfront.net/

## Deploy to AWS

- setup your aws credentials in `~/.aws/credentials` file with admin rights

```
[default]
aws_access_key_id = YOUR KEY ID
aws_secret_access_key = YOUR ACCESS KEY
```

- create terraform remote state bucket on your AWS account

```
aws s3api create-bucket \
    --bucket cat-breeds-terraform-remote \
    --region eu-west-1 \
    --create-bucket-configuration LocationConstraint=eu-west-1
```

- init terraform

```
cd .ci/cat-breeds
terraform init -backend-config="bucket=cat-breeds-terraform-remote"
```

- build for production

```

npm run build cats-ui --configuration=production
npm run build cats-bff --configuration=production
```

- apply terraform

```
terraform apply -auto-approve -var-file=configuration.tfvars
```

- terraform destroy after no longer used

```
terraform destroy -auto-approve -var-file=configuration.tfvars
```

## Run locally

```
npm install
docker run -p 8000:8000 amazon/dynamodb-local
npm run serve cats-ui
npm run serve cats-bff --configuration=local
```

Your website should be running on `http://localhost:4200`
