import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.RebuildStructSpecialController,

  controllers.ConfirmUserEmailController,
  controllers.LoginUserController,
  controllers.RegisterUserController
];
