# Mprove

[Demo](https://mprove.io/login) |
[Docs](https://mprove.io/docs) |
[Website](https://mprove.io)

Mprove - SQL analytics and dashboards for BigQuery. Inspired by [Looker](https://looker.com/).

## Deploy on server with https

Docker and Docker compose must be installed. DigitalOcean docker droplet fits well.

Open server ports 80, 443

Create folders on server:
```
mkdir -p /mprove_data/db/mysql
mkdir -p /mprove_data/backend
mkdir -p /mprove_certs
mkdir -p /mprove-docker-deploy
```

Put your SSL certificate `cert.pem` and `key.pem` files to `mprove_certs` folder.

Copy `mprove/deploy/docker/ce-prod/docker-compose.yml` to `/mprove-docker-deploy/` folder.

Create `.env` file in `/mprove-docker-deploy/` folder.

```
TAG=1.0.0

MYSQL_ROOT_PASSWORD=...
MYSQL_DATABASE=my_dev

BLOCKML_PORT=8081

BACKEND_PORT=8080
BACKEND_JWT_SECRET=...
BACKEND_DB_PASSWORD_DEV=...
BACKEND_MAILGUN_ACTIVE_API_KEY=...
BACKEND_MAILGUN_DOMAIN=...
BACKEND_SEND_EMAIL_FROM='"Name" <name@example.com>'
```

Run:
```
docker-compose up -d
```


## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).