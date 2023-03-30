# Moon Farming Bot

This is a project designed to setup a Google Cloud Function that will periodically harvest, add liquidity and stake it. It is initially configured to perform these actions on the MOON-ETH Liquidity Pair, but could be extended for any Liquidity Pair.

### Run locally

#### Prereq
- NodeJS version 16
- Google Functions Framework

### Deploy the cloud function from local
gcloud functions deploy moon-farming-bot --region=us-central1 --runtime=nodejs16 --source=. --entry-point=sow --trigger-topic=moon-farm-bot --set-secrets=MNEMONIC=projects/<your_project_id>/secrets/wallet-passphrase:1
