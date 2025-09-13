import boto3
from botocore.exceptions import ClientError

def upload_file_to_s3(file_path: str, bucket: str, key: str, metadata=None):
    print(f"Uploading {file_path} to s3://{bucket}/{key} with metadata: {metadata}")
    s3_client = boto3.client("s3")
    region = s3_client.meta.region_name or "us-east-1"
    # Check if bucket exists, create if not
    try:
        s3_client.head_bucket(Bucket=bucket)
    except ClientError as e:
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            # Bucket does not exist, create it
            if region == "us-east-1":
                s3_client.create_bucket(Bucket=bucket)
            else:
                s3_client.create_bucket(
                    Bucket=bucket,
                    CreateBucketConfiguration={"LocationConstraint": region}
                )
    extra_args = {"Metadata": metadata} if metadata else {}
    s3_client.upload_file(file_path, bucket, key, ExtraArgs=extra_args)
