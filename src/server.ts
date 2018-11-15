import * as bodyParser from 'body-parser';
import * as compression from 'compression'; // compresses requests
import * as express from 'express';
import * as expressWs from 'express-ws';
import * as lusca from 'lusca';
import * as logger from 'morgan';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionOptions
} from 'typeorm';
import { api } from './barrels/api';
import { constants } from './barrels/constants';
import { controller } from './barrels/controller';
import { credentials } from './barrels/credentials';
import { enums } from './barrels/enums';
import { handler } from './barrels/handler';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { middleware } from './barrels/middleware';
import { scheduler } from './barrels/scheduler';
import { start } from './barrels/start';
import { store } from './barrels/store';

import expressValidator = require('express-validator');

// import {
//   config.DB_TYPE,
//   config.DB_HOST,
//   config.DB_PORT,
//   config.DB_USERNAME,
//   config.DB_PASSWORD,
//   config.DB_DATABASE
// } from './configs/config';

run().catch(e => {
  console.log(e); // TODO: console log e
});

async function run() {
  // read connection options from ormconfig file (or ENV variables)
  const connectionOptions = <ConnectionOptions>(
    await getConnectionOptions().catch(e =>
      helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_GET_CONNECTION_OPTIONS)
    )
  );

  Object.assign(connectionOptions, {
    // synchronize: true, // TODO: synchronize: false in prod
    //   type: config.DB_TYPE,
    //   host: config.DB_HOST,
    //   port: config.DB_PORT,
    //   username: config.DB_USERNAME,
    //   password: config.DB_PASSWORD,
    //   database: config.DB_DATABASE,
    entities: [__dirname + '/models/store/entities/*.js'],
    // entities: [
    //   DashboardEntity,
    //   ErrorEntity,
    //   FileEntity,
    //   MconfigEntity,
    //   MemberEntity,
    //   ModelEntity,
    //   ProjectEntity,
    //   QueryEntity,
    //   RepoEntity,
    //   SessionEntity,
    //   UserEntity,
    // ],
    migrations: [__dirname + '/migration/*.js']
    // migrations: ['src/migration/*.js'],
    //   cli: {
    //     migrationsDir: 'src/migration'
    //   }
  });

  // create connection with database
  // note that it's not active database connection
  // TypeORM creates connection pools and uses them for your requests
  const connection = <Connection>(
    await createConnection(connectionOptions).catch(e =>
      helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_CREATE_CONNECTION)
    )
  );

  await connection
    .dropDatabase() // TODO: remove synchronize in prod
    .catch(e =>
      helper.reThrow(
        e,
        enums.typeormErrorsEnum.TYPEORM_CONNECTION_DROP_DATABASE
      )
    );

  await connection
    .synchronize() // TODO: remove synchronize in prod
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_SYNCHRONIZE));

  // await connection.runMigrations() // TODO: runMigrations in prod
  //   .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_RUN_MIGRATIONS));

  await start
    .addUsers()
    .catch(e => helper.reThrow(e, enums.startErrorsEnum.START_ADD_USERS));

  await start
    .addProject({
      project_id: constants.DEMO_PROJECT,
      bigquery_credentials: credentials.bigqueryMproveData
    })
    .catch(e => helper.reThrow(e, enums.startErrorsEnum.START_ADD_PROJECT));

  await start
    .addProject({
      project_id: constants.PROJECT_WOOD,
      bigquery_credentials: credentials.bigqueryMproveData
    })
    .catch(e => helper.reThrow(e, enums.startErrorsEnum.START_ADD_PROJECT));

  let itemCreateExpress = createExpress();

  scheduler.runScheduler(itemCreateExpress);
}

function createExpress() {
  const appExpress = express();

  // let options = {
  //   key: fs.readFileSync('key.pem'),
  //   cert: fs.readFileSync('cert.pem')
  // };
  // let server = https.createServer(options, appExpress);
  // const expressWsInstance = expressWs(appExpress, server);

  const expressWsInstance = expressWs(appExpress);
  const app = expressWsInstance.app;
  // const app = express();

  app.set('port', process.env.PORT || 8080);
  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(expressValidator());
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
  });

  // TODO: use erMiddleware enum

  let middlewares = [
    handler.catchAsyncErrors(
      middleware.checkRequestId,
      enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_REQUEST_ID
    ),
    handler.promisifyCatchAsyncErrors(
      middleware.checkJwt,
      enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_JWT
    ),
    handler.catchAsyncErrors(
      middleware.addUser,
      enums.middlewareErrorsEnum.MIDDLEWARE_ADD_USER
    )
  ];

  registerRoutes(app, middlewares);

  // WEBSOCKET

  let wsClients: interfaces.WebsocketClient[] = [];

  app.ws('/api/v1/webchat/:init_id', async (ws, req) => {
    let initId = req.params.init_id;
    console.log('init_id', initId);

    let storeSessions = store.getSessionsRepo();

    let session = await storeSessions
      .findOne({
        session_id: initId
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_FIND_ONE)
      );

    if (!session) {
      ws.close(4505); // init_id not found
    } else if (session.is_activated === enums.bEnum.TRUE) {
      ws.close(4503); // init_id already in use
    } else {
      session.is_activated = enums.bEnum.TRUE;

      await storeSessions
        .save(session)
        .catch(e =>
          helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_SAVE)
        );

      let wsClient: interfaces.WebsocketClient = {
        session_id: session.session_id,
        user_id: session.user_id,
        ws: ws
      };

      wsClients.push(wsClient);
    }

    // ws.on('message', (msg) => {
    //   console.log(msg);
    // });
  });

  app.use(handler.errorToResponse);

  // app.use(errorHandler()); // Provides full stack - remove for production

  app.listen(app.get('port'), () => {
    console.log(
      '  App is running at http://localhost:%d in %s mode',
      app.get('port'),
      app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');
  });

  // module.exports = app;

  return {
    express_ws_instance: expressWsInstance,
    ws_clients: wsClients
  };
}

function registerRoutes(app: expressWs.Application, middlewares: any) {
  // CONFIRM

  app.post(
    '/api/v1' + api.PATH_CONFIRM,
    middlewares,
    handler.catchAsyncErrors(
      controller.confirm,
      enums.controllerErrorsEnum.CONTROLLER_CONFIRM
    )
  );

  // FILES

  app.post(
    '/api/v1' + api.PATH_CREATE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.createFile,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_FILE
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteFile,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_FILE
    )
  );

  app.post(
    '/api/v1' + api.PATH_SAVE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.saveFile,
      enums.controllerErrorsEnum.CONTROLLER_SAVE_FILE
    )
  );

  // FOLDERS

  app.post(
    '/api/v1' + api.PATH_CREATE_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.createFolder,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_FOLDER
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteFolder,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_FOLDER
    )
  );

  app.post(
    '/api/v1' + api.PATH_RENAME_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.renameFolder,
      enums.controllerErrorsEnum.CONTROLLER_RENAME_FOLDER
    )
  );

  // MEMBERS

  app.post(
    '/api/v1' + api.PATH_CREATE_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMember,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MEMBER
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteMember,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_MEMBER
    )
  );

  app.post(
    '/api/v1' + api.PATH_EDIT_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.editMember,
      enums.controllerErrorsEnum.CONTROLLER_EDIT_MEMBER
    )
  );

  // MCONFIGS

  app.post(
    '/api/v1' + api.PATH_CREATE_MCONFIG,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMconfig,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MCONFIG
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_MCONFIG,
    middlewares,
    handler.catchAsyncErrors(
      controller.getMconfig,
      enums.controllerErrorsEnum.CONTROLLER_GET_MCONFIG
    )
  );

  // MULTI

  app.post(
    '/api/v1' + api.PATH_CREATE_DASHBOARD,
    middlewares,
    handler.catchAsyncErrors(
      controller.createDashboard,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_DASHBOARD
    )
  );

  app.post(
    '/api/v1' + api.PATH_CREATE_MCONFIG_AND_QUERY,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMconfigAndQuery,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MCONFIG_AND_QUERY
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_DASHBOARD_MCONFIG_AND_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getDashboardMconfigsQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_DASHBOARD_MCONFIGS_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_LIVE_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.setLiveQueries,
      enums.controllerErrorsEnum.CONTROLLER_SET_LIVE_QUERIES
    )
  );

  // PROJECTS

  app.post(
    '/api/v1' + api.PATH_CHECK_PROJECT_ID_UNIQUE,
    middlewares,
    handler.catchAsyncErrors(
      controller.checkProjectIdUnique,
      enums.controllerErrorsEnum.CONTROLLER_CHECK_PROJECT_ID_UNIQUE
    )
  );

  app.post(
    '/api/v1' + api.PATH_CREATE_PROJECT,
    middlewares,
    handler.catchAsyncErrors(
      controller.createProject,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_PROJECT
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_PROJECT,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteProject,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_PROJECT
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_CREDENTIALS,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectCredentials,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_CREDENTIALS
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_QUERY_SIZE_LIMIT,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectQuerySizeLimit,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_QUERY_SIZE_LIMIT
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_TIMEZONE,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectTimezone,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_TIMEZONE
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_WEEK_START,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectWeekStart,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_WEEK_START
    )
  );

  // QUERIES

  app.post(
    '/api/v1' + api.PATH_GET_PDT_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getPdtQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_PDT_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_QUERY_WITH_DEP_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getQueryWithDepQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_QUERY_WITH_DEP_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_RUN_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.runQueries,
      enums.controllerErrorsEnum.CONTROLLER_RUN_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_RUN_QUERIES_DRY,
    middlewares,
    handler.catchAsyncErrors(
      controller.runQueriesDry,
      enums.controllerErrorsEnum.CONTROLLER_RUN_QUERIES_DRY
    )
  );

  // REPOS

  app.post(
    '/api/v1' + api.PATH_COMMIT_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.commitRepo,
      enums.controllerErrorsEnum.CONTROLLER_COMMIT_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_PULL_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.pullRepo,
      enums.controllerErrorsEnum.CONTROLLER_PULL_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_PUSH_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.pushRepo,
      enums.controllerErrorsEnum.CONTROLLER_PUSH_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_REVERT_REPO_TO_LAST_COMMIT,
    middlewares,
    handler.catchAsyncErrors(
      controller.revertRepoToLastCommit,
      enums.controllerErrorsEnum.CONTROLLER_REVERT_REPO_TO_LAST_COMMIT
    )
  );

  app.post(
    '/api/v1' + api.PATH_REVERT_REPO_TO_PRODUCTION,
    middlewares,
    handler.catchAsyncErrors(
      controller.revertRepoToProduction,
      enums.controllerErrorsEnum.CONTROLLER_REVERT_REPO_TO_PRODUCTION
    )
  );

  // STATE

  app.post(
    '/api/v1' + api.PATH_GET_STATE,
    middlewares,
    handler.catchAsyncErrors(
      controller.getState,
      enums.controllerErrorsEnum.CONTROLLER_GET_STATE
    )
  );

  // USERS

  app.post(
    '/api/v1' + api.PATH_LOGOUT_USER,
    middlewares,
    handler.catchAsyncErrors(
      controller.logoutUser,
      enums.controllerErrorsEnum.CONTROLLER_LOGOUT_USER
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_USER_NAME,
    middlewares,
    handler.catchAsyncErrors(
      controller.usersSetUserName,
      enums.controllerErrorsEnum.CONTROLLER_SET_USER_NAME
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_USER_TIMEZONE,
    middlewares,
    handler.catchAsyncErrors(
      controller.setUserTimezone,
      enums.controllerErrorsEnum.CONTROLLER_SET_USER_TIMEZONE
    )
  );
}
