# .envrc example for development

export TURBO_TELEMETRY_DISABLED=1

export CLI_DRIZZLE_POSTGRES_DATABASE_URL=postgresql://<user>:<pass>@db:<port>/<db-name>
export CLI_DRIZZLE_IS_POSTGRES_TLS=FALSE

export MPROVE_CLI_TEST_REMOTE_GIT_URL=https://github.com/mprove-io/mp6.git
export MPROVE_CLI_TEST_DESTINATION_URL=/mprove/mprove_data/mcli-repos/mp6

export CR_USERNAME=
export CR_PAT=

# google analytics

export PROPERTY_ID=
