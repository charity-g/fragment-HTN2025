# mkdir package
# pip install -r requirements.txt -t package/
# cp main_setup_lambda_handler.py package/
# cd package
# zip -r ../lambda-gif-convert.zip .
# cd ..


# Use a valid S3 bucket name (must be globally unique, lowercase, no underscores)
LAMBDA_BUCKET="lambda-function-348076083335"

# Create S3 bucket if it does not exist
aws s3api head-bucket --bucket $LAMBDA_BUCKET 2>/dev/null || \
aws s3api create-bucket --bucket $LAMBDA_BUCKET --region us-east-1

aws s3 cp ./lambda-gif-convert.zip s3://$LAMBDA_BUCKET/lambda-gif-convert.zip

read -p "This will delete and recreate the Lambda function 'ConvertWebMToVideoFormats'. Continue? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 1
fi

aws lambda delete-function \
  --function-name ConvertWebMToVideoFormats \
  --region us-east-1


aws lambda create-function \
  --function-name ConvertWebMToVideoFormats \
  --code S3Bucket=$LAMBDA_BUCKET,S3Key=lambda-gif-convert.zip \
  --role arn:aws:iam::348076083335:role/LambdaS3Role \
  --runtime python3.10 \
  --handler main_setup_lambda_handler.lambda_handler \
  --timeout 80 \
  --memory-size 256 \
  --region us-east-1

# Add S3 event trigger for Lambda function
aws lambda create-event-source-mapping \
  --function-name ConvertWebMToVideoFormats \
  --event-source arn:aws:s3:::fragment-webm \
  --event-source-arn arn:aws:s3:::fragment-webm \
  --starting-position LATEST \
  --batch-size 1 \
  --region us-east-1

# Alternatively, use AWS CLI to add S3 trigger via bucket notification:
aws s3api put-bucket-notification-configuration \
  --bucket fragment-webm \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [
      {
        "LambdaFunctionArn": "arn:aws:lambda:us-east-1:348076083335:function:ConvertWebMToVideoFormats",
        "Events": ["s3:ObjectCreated:*"]
      }
    ]
  }'
