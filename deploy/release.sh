#!/bin/bash

echo "Starting release process for deploying frontend from main..."
DEPLOY_BRANCH="deploy-production"

# Delete local deploy/staging branch
echo "Deleting local $DEPLOY_BRANCH branch..."
git branch -D $DEPLOY_BRANCH

# Delete remote deploy/staging branch
echo "Deleting remote $DEPLOY_BRANCH branch..."
git push origin --delete $DEPLOY_BRANCH

# Create new deploy/staging branch from main
echo "Creating new $DEPLOY_BRANCH branch from main..."
git checkout main
git pull origin main
git checkout -b $DEPLOY_BRANCH
git push -u origin $DEPLOY_BRANCH


echo "Released to $DEPLOY_BRANCH"