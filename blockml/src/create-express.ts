import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as lusca from 'lusca';
import * as logger from 'morgan';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import expressValidator = require('express-validator');
import { controllers } from './barrels/controllers';

export function createExpress() {
  const app = express();

  app.set('port', process.env.BLOCKML_PORT || 8081);
  app.use(compression());
  app.use(logger('dev'));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(expressValidator());
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));

  app.post('/api/v2/processDashboard', controllers.processDashboard);
  app.post('/api/v2/processQuery', controllers.processQuery);
  app.post('/api/v2/rebuildStruct', controllers.rebuildStruct);

  app.use(errorHandler());

  app.listen(app.get('port'), () => {
    console.log(
      '  App is running at http://localhost:%d in %s mode',
      app.get('port'),
      app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');
  });

  module.exports = app;
}
