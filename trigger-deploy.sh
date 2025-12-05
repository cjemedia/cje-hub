#!/bin/bash
# Trigger Vercel deployment via API

# Your project ID and deployment hook from earlier
PROJECT_ID="prj_yhD0SIWGW0aXBSprxnRyNXqd6IfU"
DEPLOY_HOOK="APecFdNALc"

echo "Triggering Vercel deployment..."
curl -X POST "https://api.vercel.com/v1/integrations/deploy/${PROJECT_ID}/${DEPLOY_HOOK}"

echo ""
echo "Deployment triggered! Check your Vercel dashboard for status."
