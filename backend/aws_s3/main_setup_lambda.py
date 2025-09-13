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


def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        print("CONTENT TYPE: " + response['ContentType'])
        return response['ContentType']
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e



def get_policy_arn(policy_name):
    iam = boto3.client('iam')
    paginator = iam.list_policies(Scope='Local')
    for policy in paginator['Policies']:
        if policy['PolicyName'] == policy_name:
            return policy['Arn']
    raise Exception(f"Policy {policy_name} not found.")



# Example usage:
# policy_arn = create_lambda_s3_policy("LambdaS3AccessPolicy")

# Example usage:
# policy_arn = get_policy_arn("LambdaS3AccessPolicy")
# role_arn = create_lambda_role("LambdaS3Role", policy_arn)

# Example usage:
# To create the Lambda function, use AWS Console or boto3's create_function.
# boto3.client('lambda').create_function(...)

# Example usage:
# To add S3 trigger to Lambda, use AWS Console or boto3's put_bucket_notification_configuration.
# Example (not implemented here for brevity):
# boto3.client('s3').put_bucket_notification_configuration(...)