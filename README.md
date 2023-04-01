# Moon Farming Bot

This is a project designed to setup a Google Cloud Function that will periodically harvest, add liquidity and stake it. It is initially configured to perform these actions on the MOON-ETH Liquidity Pair, but could be extended for any Liquidity Pair.

### Run locally

#### Prereq
- NodeJS version 16
- Google Functions Framework

### Deploy

#### Setup the infrastructure
1. Follow the README [here](infrastructure/README.md).

### Deploy the cloud function from local

1. Update the project id below to match your project id.
1. Run the command after logging in to gcloud cli: `gcloud auth login`.
    1. `gcloud functions deploy moon-farming-bot --region=us-central1 --runtime=nodejs16 --source=. --entry-point=sow --trigger-topic=moon-farm-bot --set-secrets=MNEMONIC=projects/<your_project_id>/secrets/wallet-passphrase:1`
1. If you have to update the passphrase to a different change the version number from 1 to the next version number:
    1. Example with version 3:
        1. `gcloud functions deploy moon-farming-bot --region=us-central1 --runtime=nodejs16 --source=. --entry-point=sow --trigger-topic=moon-farm-bot --set-secrets=MNEMONIC=projects/<your_project_id>/secrets/wallet-passphrase:3`
