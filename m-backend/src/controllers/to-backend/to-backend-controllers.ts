import { ToBackendDeleteRecordsController } from './records/delete-records.controller';
import { ToBackendSeedRecordsController } from './records/seed-records.controller';
import { ToBackendRegisterUserController } from './users/register-user.controller';

export const toBackendControllers = [
  // records
  ToBackendDeleteRecordsController,
  ToBackendSeedRecordsController,
  // users
  ToBackendRegisterUserController
];
