# Mprove

[Demo](https://mprove.io/login) |
[Docs](https://mprove.io/docs) |
[Website](https://mprove.io)

Mprove - SQL analytics with data modelling layer. Inspired by :heart: [Looker](https://looker.com/).

Supported databases:
* Google BigQuery
* PostgreSQL

## Deploy on server with https

Docker and Docker compose must be installed. DigitalOcean docker droplet fits well.

Open server ports 80, 443.

Create folders on server:
```
mkdir -p /mprove_data/db/mysql
mkdir -p /mprove_data/backend
mkdir -p /mprove_certs
mkdir -p /mprove-deploy-docker
```

Put your SSL certificate `cert.pem` and `key.pem` files to `mprove_certs` folder.

Copy `mprove/deploy/docker/ce-prod/docker-compose.yml` to `/mprove-deploy-docker/` folder.

Create `.env` file in `/mprove-deploy-docker/` folder. Fill in your values:

```
MPROVE_CE_RELEASE_TAG=

MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=my_db

BACKEND_DROP_DATABASE_ON_START=FALSE
BACKEND_JWT_SECRET=
BACKEND_FIRST_USER_EMAIL=
BACKEND_FIRST_USER_PASSWORD=
BACKEND_REGISTER_ONLY_INVITED_USERS=TRUE
BACKEND_SEND_EMAIL_FROM="Name" <name@example.com>

BACKEND_NODEMAILER_TRANSPORT= 

BACKEND_MAILGUN_ACTIVE_API_KEY= 
BACKEND_MAILGUN_DOMAIN= 

BACKEND_SMTP_HOST=smtp.gmail.com
BACKEND_SMTP_PORT=465
BACKEND_SMTP_SECURE=TRUE 
BACKEND_SMTP_AUTH_USER=***@gmail.com
BACKEND_SMTP_AUTH_PASSWORD=******
```
MPROVE_CE_RELEASE_TAG - see [Mprove releases](https://github.com/mprove-io/mprove/releases)  
BACKEND_JWT_SECRET - random string (recommended min length - 32 characters)  
BACKEND_SEND_EMAIL_FROM - replace with your data

BACKEND_NODEMAILER_TRANSPORT - "SMTP" or "MAILGUN" (Mailgun is email delivery service with free tier)

Run:
```
docker-compose up -d
```

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).