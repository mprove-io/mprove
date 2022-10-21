# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - Powerful self-service business intelligence app.

Inspired by :heart: [Looker](https://looker.com/).

## Local deploy with docker-compose (MacOS / Windows WSL / Linux / devcontainer)

- Clone github repo to local `mprove` folder

```
git clone https://github.com/mprove-io/mprove.git
```

- Create `mprove_data` with subfolders outside of `mprove` repo folder:

```
mkdir -p ~/mprove_data/mysql \
  ~/mprove_data/organizations \
  ~/mprove_data/dwh-postgres \
  ~/mprove_data/dwh-clickhouse \
  ~/mprove_data/dwh-clickhouse-logs \
  ~/mprove_data/blockml-logs
```

- Create secrets folder and files

```
mkdir secrets \
  && echo {} > secrets/bigquery-test.json \
  && echo '' > secrets/first-project-remote-private-key.pem \
  && echo '' > secrets/first-project-remote-public-key.pem
```

- Copy `mprove/.env.example` file to `mprove/.env` file

```
cp .env.example .env
```

- Modify `mprove/.env` variables

- Pull docker images

```
docker-compose pull db dwh-postgres dwh-clickhouse rabbit backend blockml-main-worker disk front
```

- Run docker images

```
docker-compose up db dwh-postgres dwh-clickhouse rabbit backend backend-scheduler blockml-main-worker disk front
```

- Open chrome tab and login using first user credentials

```
http://localhost:3003
```

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
