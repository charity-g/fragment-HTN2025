# Count documents in s3
aws s3 ls s3://fragment-webm/uploads/ --recursive --summarize


# check if policy exists
aws iam list-policies --query 'Policies[?PolicyName==`LambdaS3AccessPolicy`]'

# check if role exists
aws iam list-roles --query 'Roles[?RoleName==`LambdaS3Role`]'

# check if lambda function exists
aws lambda list-functions --query 'Functions[?FunctionName==`ConvertWebMToVideoFormats`]'

# invoke lambda function
aws lambda invoke --function-name ConvertWebMToVideoFormats response.json

# check if bucket notification exists
aws s3api get-bucket-notification-configuration --bucket fragment-webm