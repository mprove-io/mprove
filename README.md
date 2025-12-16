# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - All Metrics in One Place.

Mprove is a Business Intelligence tool powered by [Malloy](https://www.malloydata.dev/)

## Local Deploy using docker-compose (MacOS / Windows WSL / Linux)

#### 1. Clone github repo to local `mprove` directory

```
git clone https://github.com/mprove-io/mprove.git
```

#### 2. Change directory to `mprove`

```
cd mprove
```

#### 3. Create `mprove_data` directory

```
mkdir -p mprove_data && \
mkdir -p mprove_data/blockml-data && \
mkdir -p mprove_data/blockml-logs && \
mkdir -p mprove_data/clickstack-ch-data && \
mkdir -p mprove_data/clickstack-ch-logs && \
mkdir -p mprove_data/clickstack-db && \
mkdir -p mprove_data/db-main && \
mkdir -p mprove_data/dwh-mysql && \
mkdir -p mprove_data/dwh-postgres && \
mkdir -p mprove_data/mcli-repos && \
mkdir -p mprove_data/organizations
```

#### 4. Create `secrets` directory and empty files

```
mkdir secrets && \
echo {} > secrets/demo-project-bigquery-credentials.json && \
echo '' > secrets/demo-project-remote-private-key-encrypted.pem && \
echo '' > secrets/demo-project-remote-public-key.pem && \
echo '' > secrets/presto/catalog/pgs.properties && \
echo '' > secrets/presto/config.properties && \
echo '' > secrets/trino/catalog/pgs.properties && \
echo '' > secrets/trino/config.properties
```

#### 5. Run script to create ".env" file with generated values

```
pnpm create-env
```

#### 6. Modify `mprove/.env`

Set most recent Mprove release tag from https://github.com/mprove-io/mprove/releases

```
MPROVE_RELEASE_TAG=
```

Set your real email address. You may need it later to receive transactional emails (for example, to change your password).

```
BACKEND_MPROVE_ADMIN_EMAIL=
```

Change your initial password if necessary. Later changes can only be done through web interface (by sending an email).

```
BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD=
```

Set SMTP parameters to be able to send transactional emails (required if you need to invite more users or be able to change user passwords).

```
BACKEND_SMTP_HOST=
BACKEND_SMTP_AUTH_USER=
BACKEND_SMTP_AUTH_PASSWORD=
```

#### 7. Run docker images

```
docker-compose up --pull db calc-postgres rabbit valkey backend blockml disk front
```

#### 8. Login

Open `http://localhost:3003` in Chrome.

Login using values from `.env` file environment variables `BACKEND_MPROVE_ADMIN_EMAIL` and `BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD`.

Continue with [Quickstart Docs](https://docs.mprove.io/docs/quickstart).

## License

Mprove is distributed under various [Licenses](https://github.com/mprove-io/mprove/blob/master/LICENSE).
