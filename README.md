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
1. Get the `PROJECT_NUMBER` by running the command: `gcloud projects list`.
1. Set the project with the project name `gcloud config set project <your_project_name`.
    1. `gcloud functions deploy my-dca-function --region=us-central1 --runtime=nodejs16 --source=. --entry-point=sow --trigger-topic=moon-farm-bot --set-secrets=MNEMONIC=projects/<PROJECT_NUMBER>/secrets/wallet-passphrase:1`
    1. Example with version 3:  
        1. `gcloud functions deploy moon-farming-bot --region=us-central1 --runtime=nodejs16 --source=. --entry-point=sow --trigger-topic=moon-farm-bot --set-secrets=MNEMONIC=projects/<PROJECT_NUMBER>/secrets/wallet-passphrase:3`
