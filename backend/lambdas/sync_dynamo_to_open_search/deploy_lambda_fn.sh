mkdir package
pip3 install -r requirements.txt -t package/
cp opensearch_lambda_handler.py package/
cd package
zip -r ../lambda-opensearch.zip .
cd ..


read -p "This will delete and recreate the Lambda function 'syncDynamoToOpenSearch'. Continue? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Aborted."
  exit 1
fi

# Delete the function if it already exists
aws lambda delete-function --function-name syncDynamoToOpenSearch --region us-east-1

# Create the function
aws lambda create-function \
  --function-name syncDynamoToOpenSearch \
  --runtime python3.9 \
  --handler opensearch_lambda_handler.lambda_handler \
  --role arn:aws:iam::348076083335:role/syncToOpenSearchRole \
  --zip-file fileb://lambda-opensearch.zip \
  --timeout 80 \
  --memory-size 256 \
  --region us-east-1