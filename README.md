# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - Powerful self-service business intelligence app.

Inspired by :heart: [Looker](https://looker.com/).

## Local deploy with docker-compose

- Clone repo to local `mprove` folder
- Create `mprove_data` with subfolders outside of `mprove` repo folder:

```
mkdir -p ~/mprove_data/mysql \
  ~/mprove_data/organizations \
  ~/mprove_data/dwh-postgres \
  ~/mprove_data/dwh-clickhouse \
  ~/mprove_data/dwh-clickhouse-logs \
  ~/mprove_data/blockml-logs
```

- Copy `mprove/.env.example` file to `mprove/.env` file
- Set environment variables in `mprove/.env` file
- Run `docker-compose pull db dwh-postgres rabbit backend blockml-single disk front`
- Run `docker-compose up db dwh-postgres rabbit backend backend-scheduler blockml-single disk front`

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
