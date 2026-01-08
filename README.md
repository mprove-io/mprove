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

If you open the directory in VS Code, you will be prompted to run Devcontainer.
If you run Devcontainer, you will not be able to run Docker and Docker Compose images inside Devcontainer.
Devcontainer is for development only.

#### 3. Create `mprove_data` directory

```
chmod +x scripts/create-mprove-data.sh
scripts/create-mprove-data.sh
```

#### 4. Run script to create ".env" file with generated values

```
chmod +x scripts/create-env.sh
scripts/create-env.sh
```

#### 5. Modify `.env`

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

Set SMTP parameters to be able to send transactional emails (required if you need to invite more users or change passwords).

```
BACKEND_SMTP_HOST=
BACKEND_SMTP_AUTH_USER=
BACKEND_SMTP_AUTH_PASSWORD=
BACKEND_SEND_EMAIL_FROM_ADDRESS=
BACKEND_SEND_EMAIL_FROM_NAME=
```

#### 6. Run docker images

```
docker-compose up --pull db calc-postgres rabbit valkey backend blockml disk front
```

#### 7. Login

Open `http://localhost:3003` in Chrome.

Login using values from `.env` file environment variables:

- `BACKEND_MPROVE_ADMIN_EMAIL`
- `BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD`

Continue with [Quickstart Docs](https://docs.mprove.io/docs/quickstart).

## License

Mprove is distributed under various [Licenses](https://github.com/mprove-io/mprove/blob/master/LICENSE).
