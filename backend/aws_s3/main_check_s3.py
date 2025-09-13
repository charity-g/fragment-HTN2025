import boto3

s3 = boto3.resource('s3')

s3_bucket = "fragment_webm"
prefix = "uploads/"

bucket = s3.Bucket(s3_bucket)
count = sum(1 for _ in bucket.objects.filter(Prefix=prefix))
print(f"Number of documents in '{s3_bucket}/{prefix}': {count}")
