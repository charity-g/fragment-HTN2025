import boto3
import urllib.parse

s3 = boto3.resource('s3')

# If not using boto3:
# import dotenv
# AWS_ID = dotenv.get_key("AWS_ID")
# AWS_SECRET = dotenv.get_key("AWS_SECRET")
# REGION_NAME = 'us-east-1'
# DEFAULT_OUTPUT_FORMAT = 'json'

# Create IAM policy for Lambda to access S3
def create_lambda_s3_policy(policy_name):
    iam = boto3.client('iam')
    policy_document = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket"
                ],
                "Resource": [
                    "arn:aws:s3:::*"
                ]
            }
        ]
    }
    response = iam.create_policy(
        PolicyName=policy_name,
        PolicyDocument=str(policy_document).replace("'", '"')
    )
    return response['Policy']['Arn']



# Create IAM role for Lambda and attach the policy
def create_lambda_role(role_name, policy_arn):
    iam = boto3.client('iam')
    assume_role_policy_document = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    role = iam.create_role(
        RoleName=role_name,
        AssumeRolePolicyDocument=str(assume_role_policy_document).replace("'", '"')
    )
    iam.attach_role_policy(
        RoleName=role_name,
        PolicyArn=policy_arn
    )
    return role['Role']['Arn']

LAMBDA_FUNCTION_NAME = "ConvertWebMToVideoFormats"
ROLE_ARN = get_role_arn("LambdaS3Role")
HANDLER = "main.lambda_handler"  # main.py or main_setup_lambda.py depending on your zip
RUNTIME = "python3.9"
LAMBDA_ZIP_PATH = "lambda_function.zip"  # Path to your zipped lambda code


# YOU MUST RUN !!! Compress-Archive -Path main_setup_lambda_handler.py -DestinationPath lambda_function.zip
def create_lambda_function():
  with open(LAMBDA_ZIP_PATH, "rb") as f:
      zipped_code = f.read()

  lambda_client = boto3.client('lambda')
  try:
      response = lambda_client.create_function(
          FunctionName=LAMBDA_FUNCTION_NAME,
          Runtime=RUNTIME,
          Role=ROLE_ARN,
          Handler=HANDLER,
          Code={'ZipFile': zipped_code},
          Description='Lambda triggered by S3 events',
          Timeout=60,
          MemorySize=128,
          Publish=True,
      )
      print("Lambda function created:", response['FunctionArn'])
  except lambda_client.exceptions.ResourceConflictException:
      print("Lambda function already exists.")


def get_policy_arn(policy_name):
    iam = boto3.client('iam')
    paginator = iam.list_policies(Scope='Local')
    for policy in paginator['Policies']:
        if policy['PolicyName'] == policy_name:
            return policy['Arn']
    raise Exception(f"Policy {policy_name} not found.")

def get_role_arn(role_name):
    iam = boto3.client('iam')
    paginator = iam.list_roles()
    for role in paginator['Roles']:
        if role['RoleName'] == role_name:
            return role['Arn']
    raise Exception(f"Role {role_name} not found.")

# Example usage: Create Lambda policy
# policy_arn = create_lambda_s3_policy("LambdaS3AccessPolicy")

# Example usage: Create Lambda role 
# policy_arn = get_policy_arn("LambdaS3AccessPolicy")
# role_arn = create_lambda_role("LambdaS3Role", policy_arn)


# Example usage: Create Lambda function
# YOU MUST RUN !!! Compress-Archive -Path main_setup_lambda_handler.py -DestinationPath lambda_function.zip
lambda_fn_arn = create_lambda_function()

# Example Usage: S3 trigger setup
BUCKET_NAME = "fragment-webm"
REGION = "us-east-1"
notification_config = {
    'LambdaFunctionConfigurations': [
        {
            'LambdaFunctionArn': response['FunctionArn'],
            'Events': ['s3:ObjectCreated:*'],
            # Optionally, add a filter for specific prefix/suffix
            # 'Filter': {
            #     'Key': {
            #         'FilterRules': [
            #             {'Name': 'suffix', 'Value': '.webm'}
            #         ]
            #     }
            # }
        }
    ]
}

s3_client = boto3.client('s3')
s3_client.put_bucket_notification_configuration(
    Bucket=BUCKET_NAME,
    NotificationConfiguration=notification_config
)

# Grant S3 permission to invoke Lambda
lambda_client.add_permission(
    FunctionName=LAMBDA_FUNCTION_NAME,
    StatementId='AllowS3Invoke',
    Action='lambda:InvokeFunction',
    Principal='s3.amazonaws.com',
    SourceArn=f'arn:aws:s3:::{BUCKET_NAME}'
)
