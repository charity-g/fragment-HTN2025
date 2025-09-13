# Count documents in s3
aws s3 ls s3://fragment-webm/uploads/ --recursive --summarize


# check if policy exists
aws iam list-policies --query 'Policies[?PolicyName==`LambdaS3AccessPolicy`]'

# check if role exists
aws iam list-roles --query 'Roles[?RoleName==`LambdaS3Role`]'
