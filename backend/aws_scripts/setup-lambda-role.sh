#!/bin/bash

# Create IAM role for Lambda function
ROLE_NAME="fragment-opensearch-lambda-role"
POLICY_NAME="fragment-opensearch-lambda-policy"

echo "Creating IAM role for Lambda function..."

# Create the role
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://lambda-role-policy.json

# Create the permissions policy
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://lambda-permissions-policy.json

# Get the account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Attach the policy to the role
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}

# Attach the basic Lambda execution policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

echo "Role created successfully!"
echo "Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo ""
echo "You can now use this role when creating your Lambda function:"
echo "aws lambda create-function --role arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME} ..."

