

# create opensearch domain
aws opensearch create-domain --domain-name fragment-opensearch --engine-version OpenSearch_2.11 --cluster-config InstanceType=t3.small.search,InstanceCount=1 --ebs-options EBSEnabled=true,VolumeType=gp2,VolumeSize=10  --region us-east-1

# get opensearch domain
aws opensearch describe-domain --domain-name fragment-opensearch --query "DomainStatus.Endpoint" --output text

# add access policy -> DIES BIT WIRJ 
# aws opensearch update-domain-config  --domain-name fragment-opensearch --access-policies file://access-policy.json  --region us-east-1

aws dynamodb update-table --table-name fragments --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

curl -X PUT https://fragment-opensearch/fragments \
  -H 'Content-Type: application/json' \
  -d '{
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "title": { "type": "text" },
        "content": { "type": "text" },
        "timestamp": { "type": "date" }
      }
    }
  }'

#   run python lambda function

