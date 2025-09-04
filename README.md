# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - All Metrics in One Place.

Mprove is a Business Intelligence tool powered by [Malloy](https://www.malloydata.dev/)

## Local Deploy using docker-compose (MacOS / Windows WSL / Linux / devcontainer)

### 1. Clone github repo to local `mprove` directory

```
git clone https://github.com/mprove-io/mprove.git
```

### 2. Change directory to `mprove`

```
cd mprove
```

### 3. Create `mprove_data` directory with subdirectories:

```
mkdir -p mprove_data/blockml-data \
  mprove_data/blockml-logs \
  mprove_data/db-main \
  mprove_data/dwh-clickhouse \
  mprove_data/dwh-clickhouse-logs \
  mprove_data/dwh-mysql \
  mprove_data/dwh-postgres \
  mprove_data/mcli-repos \
  mprove_data/organizations \
  mprove_data/redis
```

### 4. Clean `mprove_data` directory

This command deletes content of `mprove_data` subdirectories

```
yarn clean:mprove_data
```

### 5. Create `secrets` directory and files

```
mkdir secrets \
  && echo {} > secrets/first-project-bigquery-credentials.json \
  && echo '' > secrets/first-project-remote-private-key.pem \
  && echo '' > secrets/first-project-remote-public-key.pem
```

### 6. Run script to create ".env" file with generated values

```
yarn create-env
```

### 7. Modify `mprove/.env`

Set most recent Mprove release tag from https://github.com/mprove-io/mprove/releases

```
MPROVE_RELEASE_TAG=
MPROVE_DWH_POSTGRES_TAG=
```

Set your real email address. You may need it later to receive transactional emails (for example, to change your password).

```
BACKEND_FIRST_USER_EMAIL=
```

Change your initial password if necessary. Later changes can only be done through web interface (by sending an email).

```
BACKEND_FIRST_USER_PASSWORD=
```

Set SMTP parameters to be able to send transactional emails (required if you need to add more users or to change user passwords in future).

```
BACKEND_SMTP_HOST=
BACKEND_SMTP_AUTH_USER=
BACKEND_SMTP_AUTH_PASSWORD=
```

### 8. Run docker images

```
docker-compose up --pull db dwh-postgres rabbit redis backend blockml disk front
```

### 9. Login

Open `http://localhost:3003` in Chrome

Login using values from `.env` file environment variables:

- `BACKEND_FIRST_USER_EMAIL`
- `BACKEND_FIRST_USER_PASSWORD`

Continue with [Quickstart Docs](https://docs.mprove.io/docs/quickstart)

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
