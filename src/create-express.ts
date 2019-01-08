import * as express from 'express';
import * as expressWs from 'express-ws';
import * as bodyParser from 'body-parser';
import * as compression from 'compression'; // compresses requests
import * as logger from 'morgan';
import * as lusca from 'lusca';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as crypto from 'crypto';

import expressValidator = require('express-validator');

import { interfaces } from './barrels/interfaces';
import { middleware } from './barrels/middleware';
import { store } from './barrels/store';
import { handler } from './barrels/handler';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';

import { registerRoutes } from './register-routes';
import { entities } from './barrels/entities';

export function createExpress() {
  // const localStrategy = passportLocal.Strategy;

  passport.use(
    new passportLocal.Strategy(
      {
        usernameField: 'payload[]user_id',
        passwordField: 'payload[]password'
      },
      async (userId, password, done) => {
        let storeUsers = store.getUsersRepo();

        let user = <entities.UserEntity>(
          await storeUsers
            .findOne({ user_id: userId })
            .catch(e =>
              helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE)
            )
        );

        // if (err) {
        //   return done(err);
        // }

        // Return if user not found in database
        // if (!user) {
        //   return done(null, false, {
        //     message: 'User not found'
        //   });
        // }

        // Return if password is wrong
        let hash = crypto
          .pbkdf2Sync(password, user.salt, 1000, 64, 'sha512')
          .toString('hex');

        if (hash !== user.hash) {
          return done(null, false, {
            message: 'Password is wrong'
          });
        }

        // If credentials are correct, return the user object
        return done(null, {
          email: userId
        });
      }
    )
  );

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

  let middlewares = [
    handler.catchAsyncErrors(
      middleware.checkRequestId,
      enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_REQUEST_ID
    ),
    handler.promisifyCatchAsyncErrors(
      middleware.authJwt,
      enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_JWT
    )
    // handler.promisifyCatchAsyncErrors(
    //   middleware.checkJwt,
    //   enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_JWT
    // ),
    // handler.catchAsyncErrors(
    //   middleware.addUser,
    //   enums.middlewareErrorsEnum.MIDDLEWARE_ADD_USER
    // )
  ];

  // Initialize Passport before using the route middleware
  app.use(passport.initialize());

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
    console.log('Backend is running.');
  });

  // module.exports = app;

  return {
    express_ws_instance: expressWsInstance,
    ws_clients: wsClients
  };
}
