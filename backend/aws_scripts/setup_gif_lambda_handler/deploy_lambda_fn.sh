mkdir package
pip install -r requirements.txt -t package/
cp lambda_handler.py package/
cd package
zip -r ../lambda-gif-conversion.zip .
cd ..


read -p "This will update the Lambda function 'ConvertWebMToVideoFormats'. Continue? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 1
fi

# Create the function
aws lambda update-function \
  --function-name ConvertWebMToVideoFormats \
  --runtime python3.9 \
  --handler lambda_handler.lambda_handler \
  --role arn:aws:iam::348076083335:role/LambdaS3Role \
  --zip-file fileb://lambda-gif-conversion.zip \
  --timeout 80 \
  --memory-size 256 \
  --region us-east-1