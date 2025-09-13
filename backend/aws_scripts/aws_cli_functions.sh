# Count documents in s3
aws s3 ls s3://fragment-webm/uploads/ --recursive --summarize

# check if policy exists
aws iam list-policies --query 'Policies[?PolicyName==`LambdaS3AccessPolicy`]'

# check if role exists
aws iam list-roles --query 'Roles[?RoleName==`LambdaS3Role`]'

# update lambda
zip -r lambda_function.zip main_setup_lambda_handler.py # may need to include more files in the zip    
aws lambda update-function-code --function-name ConvertWebMToVideoFormats --zip-file fileb://lambda_function.zip

# check if lambda function exists
aws lambda list-functions --query 'Functions[?FunctionName==`ConvertWebMToVideoFormats`]'
aws lambda get-function --function-name ConvertWebMToVideoFormats

# invoke lambda function
aws lambda invoke --function-name ConvertWebMToVideoFormats response.json
# test invocation with event.json
aws lambda invoke --function-name ConvertWebMToVideoFormats --payload file://event.json response.json --cli-binary-format raw-in-base64-out

# check number of invocations
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Invocations --dimensions Name=FunctionName,Value=ConvertWebMToVideoFormats --start-time 2025-01-01T00:00:00Z --end-time 2026-01-02T00:00:00Z --period 86400 --statistics Sum          

# check lambda function logs 
aws logs describe-log-groups --query 'logGroups[?logGroupName==`/aws/lambda/ConvertWebMToVideoFormats`]'

# check lambda function failures
aws logs filter-log-events --log-group-name /aws/lambda/ConvertWebMToVideoFormats 

# check if bucket notification exists
aws s3api get-bucket-notification-configuration --bucket fragment-webm

# check invocations of lambda function ConvertWebMToVideoFormats
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Invocations --dimensions Name=FunctionName,Value=ConvertWebMToVideoFormats --start-time 2023-01-01T00:00:00Z --end-time 2023-01-02T00:00:00Z --period 86400 --statistics Sum

