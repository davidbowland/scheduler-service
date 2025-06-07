# Scheduler Service

Invokes URLs on a schedule, called through EventBridge.

## Creating Events

Create a scheduled event in Event Bridge, select the function that includes "scheduler-service", then choose Input transformer with the following settings:

```json
{ "resources": "$.resources" }
```

And these settings, with the request updated to match the [Axios request config](https://axios-http.com/docs/req_config) of the scheduled request to make:

```json
{ "resources": <resources>, "request": { "url": "https://jokes-api.bowland.link/v1/jokes/random" } }
```

## Setup

The `developer` role is required to deploy this project.

### Node / NPM

1. [Node](https://nodejs.org/en/)
1. [NPM](https://www.npmjs.com/)

### AWS Credentials

To run locally, [AWS CLI](https://aws.amazon.com/cli/) is required in order to assume a role with permission to update resources. Install AWS CLI with:

```brew
brew install awscli
```

If file `~/.aws/credentials` does not exist, create it and add a default profile:

```toml
[default]
aws_access_key_id=<YOUR_ACCESS_KEY_ID>
aws_secret_access_key=<YOUR_SECRET_ACCESS_KEY>
region=us-east-2
```

If necessary, generate a [new access key ID and secret access key](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys).

Add a `developer` profile to the same credentials file:

```toml
[developer]
role_arn=arn:aws:iam::<account number>:role/developer
source_profile=default
mfa_serial=<YOUR_MFA_ARN>
region=us-east-2
```

If necessary, retrieve the ARN of the primary MFA device attached to the default profile:

```bash
aws iam list-mfa-devices --query 'MFADevices[].SerialNumber' --output text
```

## Developing Locally

### Unit Tests

[Jest](https://jestjs.io/) tests are run automatically on commit and push. If the test coverage threshold is not met, the push will fail. See `jest.config.ts` for coverage threshold.

Manually run tests with:

```bash
npm run test
```

### Prettier / Linter

Both [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) are executed on commit. Manually prettify and lint code with:

```bash
npm run lint
```

### Deploying to Production

When a pull request is merged into `master`, the lambda code is transpiled to commonjs, zipped, and then copied to S3. Afterwards, the infrastructure portion of the project is deployed, which picks up the new versions in S3 and updates each lambda.

In extreme cases, lambdas can be transpiled, zipped, and uploaded locally with:

```bash
npm run deploy
```

## Infrastructure

See the template.yaml file for information on updating infrastructure.

## Additional Documentation

- [AWS Lambda](https://aws.amazon.com/lambda/)

- [ESLint](https://eslint.org/)

- [Jest](https://jestjs.io/)

- [Prettier](https://prettier.io/)
