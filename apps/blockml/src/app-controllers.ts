import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.GenSqlController,
  controllers.ProcessDashboardController,
  controllers.ProcessQueryController,
  controllers.RebuildStructController
];
