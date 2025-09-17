import boto3
from botocore.exceptions import ClientError
import json

def post(email):
    dynamodb = boto3.resource('dynamodb')
    table_name = 'Waitlist'

    # Create table if it doesn't exist
    try:
        table = dynamodb.Table(table_name)
        table.load()
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=[
                    {'AttributeName': 'email', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'email', 'AttributeType': 'S'}
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
            table.wait_until_exists()
        else:
            raise

    # Add email to the waitlist
    try:
        table.put_item(Item={'email': email})
        return {'status': 'success', 'email': email}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def lambda_handler(event, context):
    try:
        body = event.get('body')
        if body:
            data = json.loads(body)
        else:
            data = event
        email = data.get('email')
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing email'})
            }
        result = post(email)
        return {
            'statusCode': 200 if result['status'] == 'success' else 500,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
