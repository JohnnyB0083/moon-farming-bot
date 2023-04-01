# add your own project name here

locals {
  project_name = "johnnb0083-moon-farming-bot"
  billing_account = "dca-bot-billing"
  project_name_description = "Production Farming Bot"
  region       = "us-central1"
}

# Setup a billing account and add the name here
data "google_billing_account" "moon-farming-account" {
  display_name = moon_project.billing_account
  open         = true
}

# Set your own alias
provider "google" {
  project = local.project_name
  region  = local.region
  zone    = "us-central1-c"
}

# Set your own name here
resource "google_project" "moon_farming_project" {
  name            = moon_project.project_name_description
  project_id      = local.project_name

  billing_account = data.google_billing_account.moon-farming-account.id

  depends_on = [
    data.google_billing_account.moon-farming-account
  ]
}

# enable APIs
resource "google_project_service" "cloud-build" {
  project = local.project_name
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud-scheduler" {
  project = local.project_name
  service = "cloudscheduler.googleapis.com"
}

resource "google_project_service" "functions" {
  project = local.project_name
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "logging" {
  project = local.project_name
  service = "logging.googleapis.com"
}

resource "google_project_service" "pub-sub" {
  project = local.project_name
  service = "pubsub.googleapis.com"
}

resource "google_project_service" "secret-manager" {
  project = local.project_name
  service = "secretmanager.googleapis.com"
}

resource "google_service_account" "cloud_function_sa" {
  # must be less than 28 characters
  account_id   = "${local.project_name}csa"
  display_name = "Moon Farming Service Account"
  description  = "Service Account used for the Moon Farming Cloud Function."
  project      = local.project_name
}

resource "google_project_iam_member" "cloud_function_secret_access" {
  project = local.project_name
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${local.project_name}@appspot.gserviceaccount.com"

  depends_on = [
    google_project_service.secret-manager
  ]
}

resource "google_project_iam_member" "cloud_function_secret_access_two" {
  project = local.project_name
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"

  depends_on = [
    google_project_service.secret-manager
  ]
}

resource "google_secret_manager_secret" "wallet_passphrase" {
  secret_id = "wallet-passphrase"
  project   = local.project_name

  replication {
    automatic = true
  }

  depends_on = [
    google_project_service.secret-manager
  ]
}

resource "google_project_iam_member" "cloud_function_pub_sub" {
  project = local.project_name
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.cloud_function_sa.email}"

  depends_on = [
    google_project_service.pub-sub
  ]
}

resource "google_pubsub_topic" "dca_bot_topic" {
  name    = "moon-farm-bot"
  project = local.project_name

  depends_on = [
    google_project_service.pub-sub
  ]
}

resource "google_cloud_scheduler_job" "job_moon" {
  name        = "moon-farm-bot-scheduler"
  description = "This scheduler triggers the harvesting and staking."
  schedule    = "21 4 * * *"
  time_zone   = "America/Phoenix"
  project     = local.project_name
  region      = local.region

  pubsub_target {
    topic_name = google_pubsub_topic.dca_bot_topic.id
    data       = ""
  }

  retry_config {
    retry_count = 0
  }

  depends_on = [
    google_project_service.cloud-scheduler
  ]
}
