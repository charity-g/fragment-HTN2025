from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3

region = 'us-east-1'  # your region
service = 'es'
INDEX_NAME = 'TODO AFTER INDEX ADDED'  

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

host = 'search-fragment-opensearch-or6bk37m3wqja5rog4rtn3sog4.us-east-1.es.amazonaws.com'  

client = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

# Search
result = client.search(index='TODO-HERE', body={"query": {"match_all": {}}})
print(result)

def search_opensearch(query_string: str):
    body = {
        "query": {
            "multi_match": {
                "query": query_string,
                "fields": ["title", "content", "tags"]  # adjust fields as needed
            }
        }
    }
    result = client.search(index=INDEX_NAME, body=body)
    return result

# Example usage:
if __name__ == "__main__":
    query = "test"
    result = search_opensearch(query)
    print(result)
