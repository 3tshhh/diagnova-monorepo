# AWS Deployment Checklist

This repository is set up for a `dev -> main -> AWS EC2` flow:

1. Push work to `dev`
2. CI passes on `dev`
3. CI creates or updates a PR from `dev` to `main`
4. GitHub auto-merge completes that PR when required checks are green
5. A push to `main` builds Docker images, pushes them to ECR, and deploys them on EC2 over SSH

## Recommended GitHub branch rules

Configure branch protection in GitHub:

- `dev`
- `main`

Require the `CI` workflow before merge, and block direct pushes to `main`.
Enable auto-merge in the repository settings so the CI workflow can queue the generated PR for merge.

## Required GitHub variables

Add these repository variables:

- `AWS_REGION`
- `PUBLIC_API_BASE_URL`
- `ECR_REPOSITORY_API`
- `ECR_REPOSITORY_WEB`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_PORT`
- `EC2_DEPLOY_PATH`

Example values:

- `AWS_REGION=eu-north-1`
- `PUBLIC_API_BASE_URL=https://api.example.com/api`
- `ECR_REPOSITORY_API=diagnova-api`
- `ECR_REPOSITORY_WEB=diagnova-web`
- `EC2_HOST=ec2-13-50-1-1.eu-north-1.compute.amazonaws.com`
- `EC2_USER=ubuntu`
- `EC2_SSH_PORT=22`
- `EC2_DEPLOY_PATH=/opt/diagnova`

## Required GitHub secrets

Preferred:

- `AWS_DEPLOY_ROLE_ARN`

Fallback:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

Required for EC2 deployment:

- `EC2_SSH_PRIVATE_KEY`

Optional:

- `DISCORD_CI_WEBHOOK`
- `DISCORD_DEPLOY_WEBHOOK`
- `TURBO_TOKEN`
- `TURBO_TEAM`

## AWS resources expected by the workflow

Provision these before the first production deploy:

- One ECR repository for the API image
- One ECR repository for the web image
- One EC2 instance in the same AWS region as ECR
- Docker Engine and Docker Compose plugin installed on the EC2 instance
- AWS CLI installed on the EC2 instance
- A directory on the instance matching `EC2_DEPLOY_PATH`
- A runtime env file on the instance at `EC2_DEPLOY_PATH/apps/api/.env`
- Security groups that expose ports `80` and, if needed, `3000`
- A load balancer or reverse proxy if you want TLS or multiple domains
- Runtime secrets for the API container, including `DATABASE_URL`, `REDIS_URL`, JWT secrets, S3 secrets, `APP_BASE_URL`, `BASE_URL`, `FASTAPI_URL`, and `INTERNAL_SECRET`

## Where to get the AWS values

- `AWS_REGION`
  Get it from the AWS Console region picker.
  This project uses `eu-north-1` (Stockholm).

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
  IAM Console -> Users -> your deploy user -> Security credentials -> Create access key.
  Prefer using an IAM role with GitHub OIDC instead of long-lived keys when possible.

- `AWS_DEPLOY_ROLE_ARN`
  IAM Console -> Roles -> open the deploy role -> copy the Role ARN.

- `ECR_REPOSITORY_API` and `ECR_REPOSITORY_WEB`
  AWS Console -> Elastic Container Registry -> Repositories.
  Create two repositories and use their repository names, not the full URI.

- `EC2_HOST`
  EC2 Console -> Instances -> select your server -> Public IPv4 DNS or Elastic IP/DNS.

- `EC2_USER`
  Depends on the AMI.
  Ubuntu AMIs usually use `ubuntu`.
  Amazon Linux usually uses `ec2-user`.

- `EC2_SSH_PORT`
  Usually `22` unless you changed SSH to a custom port.

- `EC2_DEPLOY_PATH`
  Choose the folder on the server where deployment files live, for example `/opt/diagnova`.

- `EC2_SSH_PRIVATE_KEY`
  Use the private key that matches the key pair or authorized key on the EC2 instance.
  Store the full private key text in GitHub Secrets.

## Important current limitation

The repository currently contains deployable `api` and `web` apps. The AI service directory is not present in the working tree right now, so the AWS deployment workflow intentionally deploys only `api` and `web`.
