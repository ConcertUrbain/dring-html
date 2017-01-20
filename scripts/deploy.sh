#!/bin/sh
set -e

echo "Zipping sources"
# rm -rf build && mkdir -p build
# zip -r build/application.zip . -x *.git* build\*

STACK_NAME=${STACK_NAME:-'Dring93'}
BUCKET=${DEPLOYMENT_BUCKET:-'chatanoo-deployments-eu-west-1'}

# echo "Deploy $TRAVIS_TAG version to S3"
# aws s3 cp infra/dring.cfn.yml s3://$DEPLOYMENT_BUCKET/infra/front/dring/$TRAVIS_TAG.cfn.yml
# aws s3 cp build/application.zip s3://$DEPLOYMENT_BUCKET/front/dring/$TRAVIS_TAG.zip
#
# echo "Upload latest"
# aws s3api put-object \
#   --bucket $DEPLOYMENT_BUCKET \
#   --key infra/front/dring/latest.cfn.yml \
#   --website-redirect-location /infra/front/dring/$TRAVIS_TAG.cfn.yml
# aws s3api put-object \
#   --bucket $DEPLOYMENT_BUCKET \
#   --key front/dring/latest.zip \
#   --website-redirect-location /front/dring/$TRAVIS_TAG.zip
#
# echo "Deploy to CloudFormation"
# set +e
# aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION > /dev/null
# STACK_EXISTS=$?
# set -e
# if [ $STACK_EXISTS -eq 0 ]; then
#   ACTION='update-stack'
# else
#   ACTION='create-stack'
# fi
#
# aws cloudformation $ACTION \
#   --stack-name $STACK_NAME \
#   --parameters "[ \
#     { \"ParameterKey\": \"Proxy\", \"ParameterValue\": \"\" }, \
#     { \"ParameterKey\": \"ApiKey\", \"ParameterValue\": \"$CF_API_KEY\" }, \
#     { \"ParameterKey\": \"ChatanooStack\", \"ParameterValue\": \"$CF_CHATANOO_STACK\" }, \
#     { \"ParameterKey\": \"DeploymentBucket\", \"ParameterValue\": \"$BUCKET\" }, \
#     { \"ParameterKey\": \"DeploymentZipKey\", \"ParameterValue\": \"front/dring/$TRAVIS_TAG.zip\" }, \
#     { \"ParameterKey\": \"Password\", \"ParameterValue\": \"$CF_PASSWORD\" }, \
#     { \"ParameterKey\": \"ProjectName\", \"ParameterValue\": \"$STACK_NAME\" }, \
#     { \"ParameterKey\": \"Route53HostedZone\", \"ParameterValue\": \"$CF_ROUTE53_HOSTED_ZONE\" }, \
#     { \"ParameterKey\": \"SubDomainName\", \"ParameterValue\": \"$CF_SUBDOMAIN_NAME\" }, \
#     { \"ParameterKey\": \"User\", \"ParameterValue\": \"$CF_USER\" }, \
#     { \"ParameterKey\": \"UseSecureConnection\", \"ParameterValue\": \"$CF_USE_SECURE_CONNECTION\" } \
#   ]" \
#   --template-url https://s3-$REGION.amazonaws.com/$BUCKET/infra/front/dring/$TRAVIS_TAG.cfn.yml \
#   --capabilities CAPABILITY_IAM \
#   --region $REGION

CLOUDFRONT=`aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query "Stacks[0].Outputs[?OutputKey == 'CDNDistribution'] | [0].OutputValue" --output text`
if [ "$CLOUDFRONT" != "None" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT \
    --invalidation-batch "{\"Paths\": { \"Quantity\": 1, \"Items\": [\"/*\"] }, \"CallerReference\": \"travis\"}"
fi
