import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.GenSqlController,
  controllers.ProcessQueryController,
  controllers.RebuildStructController,
  controllers.GetTimeRangeController
];
