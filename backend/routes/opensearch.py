from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3

region = 'us-east-1'  # your region
service = 'es'

# Get IAM credentials from environment / instance / role
session = boto3.Session()
credentials = session.get_credentials()
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

host = 'search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'  # OpenSearch endpoint

client = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

# Index a document
response = client.index(
    index='my-index',
    body={"title": "Test", "views": 1}
)

# Search
result = client.search(index='my-index', body={"query": {"match_all": {}}})
print(result)
