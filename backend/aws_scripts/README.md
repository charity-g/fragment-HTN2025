
`conda create --name <env_name> --file requirements.txt`


# Video Capture and Ingestion
```
Chrome Extension
  └───► Python Server
         └───► Webm S3
                └───► Lambda function
                    └───► Gif S3
```

# OpenSearch querying
```
DynamoDB
  └───► DynamoDB Stream (new/updated records)
         └───► Lambda function
                └───► OpenSearch (index/write document)
```