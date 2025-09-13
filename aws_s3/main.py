import boto3

s3 = boto3.resource('s3')

# To trigger a Lambda function on S3 bucket configuration changes:
# 1. Enable CloudTrail in your AWS account to log S3 bucket-level events.
# 2. Create an EventBridge rule for CloudTrail events with source "aws.s3" and detail-type "AWS API Call via CloudTrail".
#    Example event pattern for bucket creation:
#    {
#      "source": ["aws.s3"],
#      "detail-type": ["AWS API Call via CloudTrail"],
#      "detail": {
#        "eventName": ["CreateBucket", "PutBucketAcl", "PutBucketPolicy", "PutBucketVersioning"]
#      }
#    }
# 3. Create a Lambda function and set the EventBridge rule as its trigger.

# Example: Create an EventBridge rule using boto3 (for illustration)
eventbridge = boto3.client('events')
lambda_arn = 'arn:aws:lambda:REGION:ACCOUNT_ID:function:FUNCTION_NAME'  # Replace with your Lambda ARN

response = eventbridge.put_rule(
    Name='S3BucketConfigChangeRule',
    EventPattern='''
    {
      "source": ["aws.s3"],
      "detail-type": ["AWS API Call via CloudTrail"],
      "detail": {
        "eventName": [
          "CreateBucket",
          "PutBucketAcl",
          "PutBucketPolicy",
          "PutBucketVersioning"
        ]
      }
    }
    ''',
    State='ENABLED'
)

rule_arn = response['RuleArn']

# Add Lambda as target to the rule
eventbridge.put_targets(
    Rule='S3BucketConfigChangeRule',
    Targets=[
        {
            'Id': 'S3BucketConfigChangeLambda',
            'Arn': lambda_arn
        }
    ]
)

# You must also grant EventBridge permission to invoke your Lambda function:
# Use boto3's lambda client to add permission:
lambda_client = boto3.client('lambda')
lambda_client.add_permission(
    FunctionName='FUNCTION_NAME',  # Replace with your Lambda function name
    StatementId='EventBridgeInvokePermission',
    Action='lambda:InvokeFunction',
    Principal='events.amazonaws.com',
    SourceArn=rule_arn
)

# Note: You need to replace REGION, ACCOUNT_ID, FUNCTION_NAME with your actual values.