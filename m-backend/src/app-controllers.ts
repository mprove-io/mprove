import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.RebuildStructSpecialController,

  controllers.RegisterUserController,
  controllers.ConfirmUserEmailController
];
