import { controllers } from './barrels/controllers';

export const appControllers = [
  controllers.DeleteRecordsController,
  controllers.SeedRecordsController,

  controllers.RebuildStructSpecialController,

  controllers.ConfirmUserEmailController,
  controllers.GetUserProfileController,
  controllers.LoginUserController,
  controllers.RegisterUserController,
  controllers.SetUserNameController,
  controllers.SetUserTimezoneController
];
