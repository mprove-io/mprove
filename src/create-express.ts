import * as express from 'express';
import * as expressWs from 'express-ws';
import * as bodyParser from 'body-parser';
import * as compression from 'compression'; // compresses requests
import * as logger from 'morgan';
import * as lusca from 'lusca';
import * as passport from 'passport';

import expressValidator = require('express-validator');

import { interfaces } from './barrels/interfaces';
import { middleware } from './barrels/middleware';
import { store } from './barrels/store';
import { handler } from './barrels/handler';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';

import { registerRoutes } from './register-routes';
import { passportLocalStrategy } from './passport-local-strategy';

export function createExpress() {
  passport.use(passportLocalStrategy);

  const appExpress = express();

  const expressWsInstance = expressWs(appExpress);
  const app = expressWsInstance.app;

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
      middleware.checkJwt,
      enums.middlewareErrorsEnum.MIDDLEWARE_CHECK_JWT
    )
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
