mkdir package
pip install -r requirements.txt -t package/
cp deploy_lambda_fn.py package/
cd package
zip -r ../lambda-opensearch.zip .
cd ..

aws lambda create-function \
  --function-name syncDynamoToOpenSearch \
  --runtime python3.9 \
  --handler deploy_lambda_fn.lambda_handler \
  --role arn:aws:iam::348076083335:role/LambdaS3Role \
  --zip-file fileb://lambda-opensearch.zip \
  --timeout 80 \
  --memory-size 256 \
  --region us-east-1