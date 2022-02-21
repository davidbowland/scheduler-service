#!/usr/bin/env bash

# Stop immediately on error
set -e

# Assume developer role to apply changes
# This renders an MFA prompt, if necessary
ROLE_JSON=$(aws sts assume-role --role-arn "arn:aws:iam::$AWS_ACCOUNT_ID:role/developer" --role-session-name Developer --profile developer)
echo "export AWS_ACCESS_KEY_ID=$(jq -r '.Credentials.AccessKeyId' <<< $ROLE_JSON)"
echo "export AWS_SECRET_ACCESS_KEY=$(jq -r '.Credentials.SecretAccessKey' <<< $ROLE_JSON)"
echo "export AWS_SESSION_TOKEN=$(jq -r '.Credentials.SessionToken' <<< $ROLE_JSON)"
