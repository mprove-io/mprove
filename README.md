# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - All Metrics in One Place.

Mprove is a Business Intelligence tool powered by [Malloy](https://www.malloydata.dev/)

## Local deploy using docker-compose (MacOS / Windows WSL / Linux / devcontainer)

- Clone github repo to local `mprove` directory

```
git clone https://github.com/mprove-io/mprove.git
```

- Change directory to `mprove`

```
cd mprove
```

- Create `mprove_data` directory:

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

- Create `secrets` directory and files:

```
mkdir secrets \
  && echo {} > secrets/first-project-bigquery-credentials.json \
  && echo '' > secrets/first-project-remote-private-key.pem \
  && echo '' > secrets/first-project-remote-public-key.pem
```

- Run script to create ".env" file with generated values

```
yarn create-env
```

- Modify `mprove/.env`. Set your email address in `BACKEND_FIRST_USER_EMAIL` environment variable.

- Pull and run docker images

```
docker-compose up --pull db dwh-postgres rabbit redis backend blockml disk front
```

- Open `http://localhost:3003` in Chrome and login using first user credentials from `.env` file (`BACKEND_FIRST_USER_EMAIL` and `BACKEND_FIRST_USER_PASSWORD`)

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
