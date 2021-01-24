import { controllersToBlockml } from './controllers-to-blockml/controllers-to-blockml';
import { controllers } from './barrels/controllers';

export const appControllers = [
  ...controllersToBlockml,
  //
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,
  //
  controllers.RebuildStructSpecialController,
  //
  controllers.RegisterUserController
];
