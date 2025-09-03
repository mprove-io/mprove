# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - Self-service Business Intelligence with Version Control.

Check [Mprove Demo p1](https://github.com/mprove-io/mprove-demo-p1) for example project repository.

Inspired by :heart: [Looker](https://looker.com/).

## Deploy to a Kubernetes cluster using Helm Chart

Check [Mprove Helm Charts](https://github.com/mprove-io/mprove-helm-charts) for instructions.

## Local deploy using docker-compose (MacOS / Windows WSL / Linux / devcontainer)

- Clone github repo to local `mprove` directory

```
git clone https://github.com/mprove-io/mprove.git
```

- Change directory to `mprove`

```
cd mprove
```

- Create `mprove_data` with subfolders:

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

- Create secrets directory and files

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

- Modify `mprove/.env` (optional). See first user credentials in BACKEND_FIRST_USER_EMAIL and BACKEND_FIRST_USER_PASSWORD.

- Pull docker images

```
docker-compose pull db dwh-postgres dwh-clickhouse rabbit backend blockml-single disk front
```

- Run docker images

```
docker-compose up db dwh-postgres dwh-clickhouse rabbit backend backend-scheduler blockml-single disk front
```

- Open chrome tab and login using first user credentials

```
http://localhost:3003
```

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
