import { ToBackendDeleteRecordsController } from './records/delete-records.controller';
import { ToBackendRegisterUserController } from './users/register-user.controller';

export const toBackendControllers = [
  // records
  ToBackendDeleteRecordsController,
  // users
  ToBackendRegisterUserController
];
