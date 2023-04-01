## Steps to deploy the project

### Setup a Google Billing Account

1. Follow the steps [here](https://cloud.google.com/billing/docs/how-to/create-billing-account) to setup a billing account, take note of the billing account name.
1. In the example.main.tf file update the following variables under `moon_project`.
    1. project_name: Any String, should be unique.
    1. billing_account: The billing account from above.
    1. project_name_description: Description of the project.
    1. Example File:
```terraform
    variable "moon_project" {
     # update these values with your own names
    project_name = "my-special-bot-12313"
    billing_account = "charge-me-here"
    project_name_description = "My Super Special Bot"
}
```
1. Once those variables are set you can run the terraform you must be auth'd with Google Cloud.
1. Run a terraform apply plan: `terraform plan -out myplan`.
1. If everything looks good apply the plant: `terraform apply myplan`.
1. The infrastructure should be setup.
1. Add your private key to the Google Secret Manager resource manually under the `wallet_passphrase` resource.
1. This is setup to run daily, if you want to modify that change the `cron` schedule in the terraform under the `job_moon` resource.

