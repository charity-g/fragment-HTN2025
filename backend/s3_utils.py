import boto3

def upload_file_to_s3(file_path: str, bucket: str, key: str):
    s3_client = boto3.client("s3")
    s3_client.upload_file(file_path, bucket, key)
