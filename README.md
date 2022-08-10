# Mprove

[Website](https://mprove.io) | [Docs](https://docs.mprove.io)

Mprove - Powerful self-service business intelligence app.

Inspired by :heart: [Looker](https://looker.com/).

## Local deploy with docker-compose

- Clone repo
- Create mprove_data folder outside of mprove repo folder
- Go to mprove repo folder
- Copy `.env.example` file to `.env` file
- Set values in `.env` file
- Run `docker-compose pull db rabbit backend blockml-main disk front`
- Run `docker-compose up db rabbit backend backend-scheduler blockml-main blockml-worker disk front`

## License

Mprove is distributed under [Apache 2.0 License](https://github.com/mprove-io/mprove/blob/master/LICENSE).
